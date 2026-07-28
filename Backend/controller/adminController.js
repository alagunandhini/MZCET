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

    // Build the Users query with optional filters, using parameters
    // (never string-concatenate user input into SQL).
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

    // These ids came straight back from our own DB as integers, so it's
    // safe to inline them into an IN(...) list (guard with a numeric
    // filter as a defensive check, not because they're untrusted input).
    const userIds = users.map((u) => u.id).filter(Number.isInteger);
    const idsList = userIds.join(",");

    const [resultsRes, attemptsRes, timeTakenRes] = await Promise.all([
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

    // Index by "userId_round" for O(1) lookup while building each student row
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