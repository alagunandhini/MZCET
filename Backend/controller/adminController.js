// admin controller — SQL Server version
const { getPool, sql } = require("../db-sql");

const ROUND_KEYS = ["Round1", "Round2", "Round3", "Round4"];
const MAX_ATTEMPTS = 3;

// GET /admin/departments
exports.getDepartments = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT DISTINCT department
      FROM Users
      WHERE department IS NOT NULL AND department <> ''
    `);
    const departments = result.recordset.map((r) => r.department);
    res.json({ success: true, departments });
  } catch (err) {
    console.error("getDepartments error:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

// GET /admin/years
exports.getYears = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT DISTINCT year
      FROM Users
      WHERE year IS NOT NULL AND year <> ''
    `);
    const years = result.recordset.map((r) => r.year);
    res.json({ success: true, years });
  } catch (err) {
    console.error("getYears error:", err);
    res.status(500).json({ error: "Failed to fetch years" });
  }
};

// GET /admin/students?department=CSE&year=2nd Year
exports.getStudents = async (req, res) => {
  try {
    const { department, year } = req.query;
    const pool = getPool();

    const usersRequest = pool.request();
    let where = "WHERE 1=1";

    if (department && department !== "All") {
      where += " AND department = @department";
      usersRequest.input("department", sql.NVarChar, department);
    }
    if (year && year !== "All") {
      where += " AND year = @year";
      usersRequest.input("year", sql.NVarChar, year);
    }

    const usersResult = await usersRequest.query(`
      SELECT id, name, registerNumber, department, year, isFirstLogin
      FROM Users
      ${where}
    `);
    const users = usersResult.recordset;

    if (users.length === 0) {
      return res.json({ success: true, students: [] });
    }

    const userIds = users.map((u) => u.id).filter((id) => id != null);
    const idsList = userIds.join(",");

    let resultsRes = { recordset: [] };
    let attemptsRes = { recordset: [] };
    let timeTakenRes = { recordset: [] };

    try {
      [resultsRes, attemptsRes, timeTakenRes] = await Promise.all([
        pool.request().query(`
          SELECT userId, round, bestScore, result
          FROM RoundResults
          WHERE userId IN (${idsList})
        `),
        pool.request().query(`
          SELECT userId, round, attemptsUsed
          FROM RoundAttempts
          WHERE userId IN (${idsList})
        `),
        pool.request().query(`
          SELECT userId, round, timeTakenSeconds
          FROM RoundTimeTaken
          WHERE userId IN (${idsList})
        `),
      ]);
    } catch (roundErr) {
      console.warn("Round tables may not exist yet, returning students without round data:", roundErr.message);
    }

    const resultsMap = {};
    resultsRes.recordset.forEach((r) => {
      resultsMap[`${r.userId}_${r.round}`] = r;
    });

    const attemptsMap = {};
    attemptsRes.recordset.forEach((a) => {
      attemptsMap[`${a.userId}_${a.round}`] = a.attemptsUsed;
    });

    const timeTakenMap = {};
    timeTakenRes.recordset.forEach((t) => {
      timeTakenMap[`${t.userId}_${t.round}`] = t.timeTakenSeconds;
    });

    const students = users.map((user) => {
      const rounds = {};

      ROUND_KEYS.forEach((roundKey) => {
        const result = resultsMap[`${user.id}_${roundKey}`];
        const attemptsUsed = attemptsMap[`${user.id}_${roundKey}`] || 0;
        const timeTakenSeconds = timeTakenMap[`${user.id}_${roundKey}`] ?? null;

        rounds[roundKey] = {
          score: result ? result.bestScore : null,
          result: result ? result.result : null,
          attemptsLeft: Math.max(MAX_ATTEMPTS - attemptsUsed, 0),
          timeTakenSeconds,
        };
      });

      return {
        name: user.name,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        loggedIn: !user.isFirstLogin,
        rounds,
      };
    });

    res.json({ success: true, students });
  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// GET /admin/students/:registerNumber
//
// Full session detail for one student: every round, every attempt within
// the round (each attempt = one InterviewSessions row -> one Feedback row),
// and every question's score/feedback (QAFeedback, one row per question).
//
// There is no "RoundAttemptDetails" table — that was never created. The
// real per-attempt data lives across InterviewSessions + Feedback +
// QAFeedback + MotivationMessages, joined by sessionId, which is what this
// query now does.
exports.getStudentDetail = async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const pool = getPool();

    const userResult = await pool
      .request()
      .input("registerNumber", sql.NVarChar, registerNumber)
      .query(`
        SELECT id, name, registerNumber, department, year, isFirstLogin
        FROM Users
        WHERE registerNumber = @registerNumber
      `);

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const [resultsRes, attemptsCountRes, sessionsRes] = await Promise.all([
      pool.request().input("userId", sql.Int, user.id).query(`
        SELECT round, bestScore, result
        FROM RoundResults
        WHERE userId = @userId
      `),
      pool.request().input("userId", sql.Int, user.id).query(`
        SELECT round, attemptsUsed
        FROM RoundAttempts
        WHERE userId = @userId
      `),
      // One row per attempt: session joined 1:1 to its feedback row.
      // INNER JOIN on Feedback deliberately excludes sessions that never
      // reached endSession/terminateRound (e.g. abandoned mid-interview
      // with no answers) — those have nothing to show the admin anyway.
      pool.request().input("userId", sql.Int, user.id).query(`
        SELECT
          s.id            AS sessionRowId,
          s.sessionId,
          s.round,
          s.attemptNumber,
          s.terminatedForViolation,
          s.createdAt,
          f.id            AS feedbackId,
          f.overallScore,
          f.result,
          f.performanceLabel,
          f.confidencePercentage,
          f.clarityPercentage,
          f.technicalScore,
          f.grammarScore,
          f.fluencyScore,
          f.overallFeedbackText,
          f.strengths,
          f.weaknesses,
          f.finalSuggestions,
          f.attemptedQuestions,
          f.skippedQuestions,
          f.durationSeconds
        FROM InterviewSessions s
        INNER JOIN Feedback f ON f.sessionId = s.id
        WHERE s.userId = @userId
        ORDER BY s.round, s.attemptNumber, s.id
      `),
    ]);

    const bestByRound = {};
    resultsRes.recordset.forEach((r) => {
      bestByRound[r.round] = r;
    });

    const attemptsUsedByRound = {};
    attemptsCountRes.recordset.forEach((a) => {
      attemptsUsedByRound[a.round] = a.attemptsUsed;
    });

    const feedbackIds = sessionsRes.recordset.map((r) => r.feedbackId);
    let qaByFeedbackId = {};
    let motivationByFeedbackId = {};

    if (feedbackIds.length > 0) {
      const idsList = feedbackIds.join(",");

      const [qaRes, motivationRes] = await Promise.all([
        pool.request().query(`
          SELECT feedbackId, questionNumber, question, userAnswer, improvedAnswer, questionScore, aiFeedback
          FROM QAFeedback
          WHERE feedbackId IN (${idsList})
          ORDER BY feedbackId, questionNumber
        `),
        pool.request().query(`
          SELECT feedbackId, message
          FROM MotivationMessages
          WHERE feedbackId IN (${idsList})
        `),
      ]);

      qaRes.recordset.forEach((row) => {
        if (!qaByFeedbackId[row.feedbackId]) qaByFeedbackId[row.feedbackId] = [];
        qaByFeedbackId[row.feedbackId].push({
          questionNumber: row.questionNumber,
          question: row.question,
          user_answer: row.userAnswer,
          improved_answer: row.improvedAnswer,
          question_score: row.questionScore,
          question_feedback: row.aiFeedback,
        });
      });

      motivationRes.recordset.forEach((row) => {
        if (!motivationByFeedbackId[row.feedbackId]) motivationByFeedbackId[row.feedbackId] = [];
        motivationByFeedbackId[row.feedbackId].push(row.message);
      });
    }

    const attemptsByRound = {};
    sessionsRes.recordset.forEach((row) => {
      if (!attemptsByRound[row.round]) attemptsByRound[row.round] = [];

      let strengths = [];
      let weaknesses = [];
      try { strengths = row.strengths ? JSON.parse(row.strengths) : []; } catch (e) { strengths = []; }
      try { weaknesses = row.weaknesses ? JSON.parse(row.weaknesses) : []; } catch (e) { weaknesses = []; }

      attemptsByRound[row.round].push({
        sessionId: row.sessionId,
        attemptNumber: row.attemptNumber,
        score: row.overallScore,
        result: row.result,
        date: row.createdAt,
        durationSeconds: row.durationSeconds,
        attemptedQuestions: row.attemptedQuestions,
        skippedQuestions: row.skippedQuestions,
        communication: {
          confidence_percentage: row.confidencePercentage,
          clarity_percentage: row.clarityPercentage,
        },
        technicalScore: row.technicalScore,
        grammarScore: row.grammarScore,
        fluencyScore: row.fluencyScore,
        performanceLabel: row.performanceLabel,
        overallFeedback: row.overallFeedbackText,
        strengths,
        weaknesses,
        finalSuggestions: row.finalSuggestions,
        terminatedForViolation: !!row.terminatedForViolation,
        motivationMessages: motivationByFeedbackId[row.feedbackId] || [],
        qaFeedback: qaByFeedbackId[row.feedbackId] || [],
      });
    });

    const rounds = {};
    ROUND_KEYS.forEach((roundKey) => {
      const best = bestByRound[roundKey];
      const attemptsUsed = attemptsUsedByRound[roundKey] || 0;
      const attempts = (attemptsByRound[roundKey] || []).sort(
        (a, b) => (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0)
      );
      rounds[roundKey] = {
        bestScore: best ? best.bestScore : null,
        bestResult: best ? best.result : null,
        attemptsUsed,
        attemptsLeft: Math.max(MAX_ATTEMPTS - attemptsUsed, 0),
        // Duration now reported from the most recent attempt's own
        // Feedback.durationSeconds instead of the round-level RoundTimeTaken
        // value, so it can never silently point at the wrong attempt.
        timeTaken: attempts.length > 0 ? attempts[attempts.length - 1].durationSeconds : null,
        attempts,
      };
    });

    res.json({
      success: true,
      student: {
        name: user.name,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        loggedIn: !user.isFirstLogin,
      },
      rounds,
    });
  } catch (err) {
    console.error("getStudentDetail error:", err);
    res.status(500).json({ error: "Failed to fetch student detail" });
  }
};