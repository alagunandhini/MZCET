const { getPool, sql } = require("../db-sql");
const { generateGroqFeedback } = require("./groqFeedback");

// Rebuilds the full nested feedback JSON (matching the old Mongo shape)
// from the three separate SQL tables it's now split across.
async function buildFeedbackResponse(pool, feedbackRow) {
  const motivationResult = await pool.request()
    .input("feedbackId", sql.Int, feedbackRow.id)
    .query("SELECT message FROM MotivationMessages WHERE feedbackId = @feedbackId");

  const qaResult = await pool.request()
    .input("feedbackId", sql.Int, feedbackRow.id)
    .query("SELECT question, userAnswer, improvedAnswer FROM QAFeedback WHERE feedbackId = @feedbackId");

  return {
    overallScore: feedbackRow.overallScore,
    result: feedbackRow.result,
    performance_label: feedbackRow.performanceLabel,
    communication: {
      confidence_percentage: feedbackRow.confidencePercentage,
      clarity_percentage: feedbackRow.clarityPercentage,
    },
    overall_feedback: feedbackRow.overallFeedbackText,
    attempted_questions: feedbackRow.attemptedQuestions,
    skipped_questions: feedbackRow.skippedQuestions,
    motivation_message: motivationResult.recordset.map(r => r.message),
    qa_feedback: qaResult.recordset.map(r => ({
      question: r.question,
      user_answer: r.userAnswer,
      improved_answer: r.improvedAnswer,
    })),
  };
}

exports.endSession = async (req, res) => {
  try {
    const { sessionId, round, timeTaken } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID missing" });
    }

    const pool = getPool();

    // --- Find the session row ---
    const sessionResult = await pool.request()
      .input("sessionId", sql.NVarChar, sessionId)
      .query("SELECT * FROM InterviewSessions WHERE sessionId = @sessionId");

    const session = sessionResult.recordset[0];

    if (!session || !round) {
      return res.status(404).json({ error: "Session or round not found" });
    }

    const userId = session.userId;

    // --- PIECE A: don't re-grade if this session already has feedback ---
    const existingFeedback = await pool.request()
      .input("sessionRowId", sql.Int, session.id)
      .query("SELECT * FROM Feedback WHERE sessionId = @sessionRowId");

    if (existingFeedback.recordset.length > 0) {
      const feedback = await buildFeedbackResponse(pool, existingFeedback.recordset[0]);
      return res.json({ success: true, feedback });
    }

    // --- ATTEMPT LIMIT CHECK ---
    const passedResult = await pool.request()
      .input("userId", sql.Int, userId)
      .input("round", sql.NVarChar, round)
      .query("SELECT round FROM CompletedRounds WHERE userId = @userId AND round = @round");

    const alreadyPassed = passedResult.recordset.length > 0;

    const attemptsResult = await pool.request()
      .input("userId", sql.Int, userId)
      .input("round", sql.NVarChar, round)
      .query("SELECT attemptsUsed FROM RoundAttempts WHERE userId = @userId AND round = @round");

    const attemptsUsed = attemptsResult.recordset[0]?.attemptsUsed || 0;

    if (!alreadyPassed && attemptsUsed >= 3) {
      return res.status(403).json({ error: "No attempts remaining for this round" });
    }

    // --- PIECE B: pull this round's answers ---
    const answersResult = await pool.request()
      .input("sessionRowId", sql.Int, session.id)
      .input("round", sql.NVarChar, round)
      .query("SELECT questionText, transcript FROM Answers WHERE sessionId = @sessionRowId AND round = @round");

    const roundAnswers = answersResult.recordset;

    if (roundAnswers.length === 0) {
      return res.status(400).json({ error: "No answers found for this round" });
    }

    // --- PIECE C: build the text block for the AI ---
    const combinedText = roundAnswers
      .map((a, index) => `Q${index + 1}: ${a.questionText}\nA: ${a.transcript}`)
      .join("\n\n");

    // --- PIECE D: call the AI ---
    const feedback = await generateGroqFeedback(combinedText);

    const isPass = feedback.result?.toLowerCase().includes("pass");

    // --- PIECE F: safety net if AI returns wrong count ---
    if (!feedback.qa_feedback) feedback.qa_feedback = [];

    if (feedback.qa_feedback.length !== roundAnswers.length) {
      console.warn(`qa_feedback length mismatch: got ${feedback.qa_feedback.length}, expected ${roundAnswers.length}`);
      feedback.qa_feedback = feedback.qa_feedback.slice(0, roundAnswers.length);
      for (let i = feedback.qa_feedback.length; i < roundAnswers.length; i++) {
        feedback.qa_feedback.push({
          question: roundAnswers[i].questionText,
          user_answer: roundAnswers[i].transcript || "(No answer provided)",
          improved_answer: "Feedback unavailable for this answer.",
        });
      }
    }

    const attempted = roundAnswers.filter(a => a.transcript && a.transcript.trim().length > 0).length;
    const skipped = roundAnswers.length - attempted;

    // --- Everything below is one transaction: save score, attempts, feedback ---
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // --- PIECE E: keep-best-score logic for RoundResults ---
      const existingResultRow = await transaction.request()
        .input("userId", sql.Int, userId)
        .input("round", sql.NVarChar, round)
        .query("SELECT bestScore FROM RoundResults WHERE userId = @userId AND round = @round");

      const existingBest = existingResultRow.recordset[0]?.bestScore;
      const isNewScoreBetter = existingBest === undefined || feedback.overallScore > existingBest;

      if (isNewScoreBetter) {
        if (existingBest === undefined) {
          await transaction.request()
            .input("userId", sql.Int, userId)
            .input("round", sql.NVarChar, round)
            .input("bestScore", sql.Int, feedback.overallScore)
            .input("result", sql.NVarChar, feedback.result)
            .query(`
              INSERT INTO RoundResults (userId, round, bestScore, result)
              VALUES (@userId, @round, @bestScore, @result)
            `);
        } else {
          await transaction.request()
            .input("userId", sql.Int, userId)
            .input("round", sql.NVarChar, round)
            .input("bestScore", sql.Int, feedback.overallScore)
            .input("result", sql.NVarChar, feedback.result)
            .query(`
              UPDATE RoundResults SET bestScore = @bestScore, result = @result
              WHERE userId = @userId AND round = @round
            `);
        }
      }

      // --- Increment attempts ---
      if (attemptsResult.recordset.length > 0) {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .input("round", sql.NVarChar, round)
          .query("UPDATE RoundAttempts SET attemptsUsed = attemptsUsed + 1 WHERE userId = @userId AND round = @round");
      } else {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .input("round", sql.NVarChar, round)
          .query("INSERT INTO RoundAttempts (userId, round, attemptsUsed) VALUES (@userId, @round, 1)");
      }

      // --- Mark round completed if passed ---
      if (isPass && !alreadyPassed) {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .input("round", sql.NVarChar, round)
          .query("INSERT INTO CompletedRounds (userId, round) VALUES (@userId, @round)");
      }

      // --- Save time taken ---
      const existingTime = await transaction.request()
        .input("userId", sql.Int, userId)
        .input("round", sql.NVarChar, round)
        .query("SELECT id FROM RoundTimeTaken WHERE userId = @userId AND round = @round");

      if (existingTime.recordset.length > 0) {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .input("round", sql.NVarChar, round)
          .input("timeTaken", sql.Int, timeTaken || 0)
          .query("UPDATE RoundTimeTaken SET timeTakenSeconds = @timeTaken WHERE userId = @userId AND round = @round");
      } else {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .input("round", sql.NVarChar, round)
          .input("timeTaken", sql.Int, timeTaken || 0)
          .query("INSERT INTO RoundTimeTaken (userId, round, timeTakenSeconds) VALUES (@userId, @round, @timeTaken)");
      }

      // --- Save the feedback itself ---
      const feedbackInsert = await transaction.request()
        .input("sessionRowId", sql.Int, session.id)
        .input("overallScore", sql.Int, feedback.overallScore)
        .input("result", sql.NVarChar, feedback.result)
        .input("performanceLabel", sql.NVarChar, feedback.performance_label || "")
        .input("confidence", sql.Int, feedback.communication?.confidence_percentage || 0)
        .input("clarity", sql.Int, feedback.communication?.clarity_percentage || 0)
        .input("overallFeedbackText", sql.NVarChar, feedback.overall_feedback || "")
        .input("attempted", sql.Int, attempted)
        .input("skipped", sql.Int, skipped)
        .query(`
          INSERT INTO Feedback 
            (sessionId, overallScore, result, performanceLabel, confidencePercentage, clarityPercentage, overallFeedbackText, attemptedQuestions, skippedQuestions)
          OUTPUT INSERTED.id
          VALUES 
            (@sessionRowId, @overallScore, @result, @performanceLabel, @confidence, @clarity, @overallFeedbackText, @attempted, @skipped)
        `);

      const feedbackId = feedbackInsert.recordset[0].id;

      for (const msg of (feedback.motivation_message || [])) {
        await transaction.request()
          .input("feedbackId", sql.Int, feedbackId)
          .input("message", sql.NVarChar, msg)
          .query("INSERT INTO MotivationMessages (feedbackId, message) VALUES (@feedbackId, @message)");
      }

      for (const qa of feedback.qa_feedback) {
        await transaction.request()
          .input("feedbackId", sql.Int, feedbackId)
          .input("question", sql.NVarChar, qa.question || "")
          .input("userAnswer", sql.NVarChar, qa.user_answer || "")
          .input("improvedAnswer", sql.NVarChar, qa.improved_answer || "")
          .query(`
            INSERT INTO QAFeedback (feedbackId, question, userAnswer, improvedAnswer)
            VALUES (@feedbackId, @question, @userAnswer, @improvedAnswer)
          `);
      }

      await transaction.commit();

      feedback.attempted_questions = attempted;
      feedback.skipped_questions = skipped;

      res.json({ success: true, feedback });

    } catch (txErr) {
      try { await transaction.rollback(); } catch (_) {}
      throw txErr;
    }

  } catch (err) {
    console.error("end session error:", err);
    res.status(500).json({ error: "Failed to end session" });
  }
};

exports.terminateRound = async (req, res) => {
  try {
    const { sessionId, round } = req.body;

    if (!sessionId || !round) {
      return res.status(400).json({ error: "Session ID or round missing" });
    }

    const pool = getPool();

    const sessionResult = await pool.request()
      .input("sessionId", sql.NVarChar, sessionId)
      .query("SELECT * FROM InterviewSessions WHERE sessionId = @sessionId");

    let session = sessionResult.recordset[0];

    // A student can rack up violations before ever answering a single
    // question, in which case no session row exists yet — create one now,
    // same as audioController.js does on the first saved answer.
    if (!session) {
      const insertSession = await pool.request()
        .input("sessionId", sql.NVarChar, sessionId)
        .input("userId", sql.Int, req.userId)
        .input("round", sql.NVarChar, round)
        .query(`
          INSERT INTO InterviewSessions (sessionId, userId, round)
          OUTPUT INSERTED.id, INSERTED.userId
          VALUES (@sessionId, @userId, @round)
        `);
      session = insertSession.recordset[0];
    }

    const userId = session.userId;

    const passedResult = await pool.request()
      .input("userId", sql.Int, userId)
      .input("round", sql.NVarChar, round)
      .query("SELECT round FROM CompletedRounds WHERE userId = @userId AND round = @round");

    if (passedResult.recordset.length > 0) {
      return res.json({ success: true, message: "Round already passed" });
    }

    const attemptsResult = await pool.request()
      .input("userId", sql.Int, userId)
      .input("round", sql.NVarChar, round)
      .query("SELECT attemptsUsed FROM RoundAttempts WHERE userId = @userId AND round = @round");

    const attemptsUsed = attemptsResult.recordset[0]?.attemptsUsed || 0;

    if (attemptsUsed >= 3) {
      return res.status(403).json({ error: "No attempts remaining for this round" });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // A termination is treated as a 0-score fail — only overwrites the
      // saved best score if there's no better (real) attempt already on record.
      const existingResultRow = await transaction.request()
        .input("userId", sql.Int, userId)
        .input("round", sql.NVarChar, round)
        .query("SELECT bestScore FROM RoundResults WHERE userId = @userId AND round = @round");

      const existingBest = existingResultRow.recordset[0]?.bestScore;

      if (existingBest === undefined) {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .input("round", sql.NVarChar, round)
          .query("INSERT INTO RoundResults (userId, round, bestScore, result) VALUES (@userId, @round, 0, 'FAIL')");
      }
      // if a real attempt already scored higher than 0, leave it as-is

      if (attemptsResult.recordset.length > 0) {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .input("round", sql.NVarChar, round)
          .query("UPDATE RoundAttempts SET attemptsUsed = attemptsUsed + 1 WHERE userId = @userId AND round = @round");
      } else {
        await transaction.request()
          .input("userId", sql.Int, userId)
          .input("round", sql.NVarChar, round)
          .query("INSERT INTO RoundAttempts (userId, round, attemptsUsed) VALUES (@userId, @round, 1)");
      }

      await transaction.request()
        .input("sessionId", sql.NVarChar, sessionId)
        .query("UPDATE InterviewSessions SET terminatedForViolation = 1 WHERE sessionId = @sessionId");

      await transaction.commit();
    } catch (txErr) {
      try { await transaction.rollback(); } catch (_) {}
      throw txErr;
    }

    res.json({ success: true, message: "Round terminated due to violations" });

  } catch (err) {
    console.error("terminate round error:", err);
    res.status(500).json({ error: "Failed to terminate round" });
  }
};