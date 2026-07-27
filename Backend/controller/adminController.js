const User = require("../models/users");

// GET /admin/departments
// Returns the distinct list of departments currently in use, so the
// frontend filter dropdown always reflects real data instead of a
// hardcoded list that can drift out of sync.
exports.getDepartments = async (req, res) => {
  try {
    const departments = await User.distinct("department", {
      department: { $ne: "" },
    });
    res.json({ success: true, departments });
  } catch (err) {
    console.error("getDepartments error:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

// GET /admin/years
// Returns the distinct list of years currently in use, same idea as
// getDepartments above.
exports.getYears = async (req, res) => {
  try {
    const years = await User.distinct("year", {
      year: { $ne: "" },
    });
    res.json({ success: true, years });
  } catch (err) {
    console.error("getYears error:", err);
    res.status(500).json({ error: "Failed to fetch years" });
  }
};

// GET /admin/students?department=CSE&year=2nd Year
// Returns one summary row per student: name, register number, department,
// year, per-round score + attempts-left, and whether they've logged in
// before. Any filter omitted (or "All") is not applied.
exports.getStudents = async (req, res) => {
  try {
    const { department, year } = req.query;

    const filter = {};
    if (department && department !== "All") {
      filter.department = department;
    }
    if (year && year !== "All") {
      filter.year = year;
    }

    const users = await User.find(filter).select(
      "name registerNumber department year isFirstLogin roundResults roundAttempts"
    );

    const ROUND_KEYS = ["Round1", "Round2", "Round3", "Round4"];
    const MAX_ATTEMPTS = 3;

    const students = users.map((user) => {
      const rounds = {};

      ROUND_KEYS.forEach((roundKey) => {
        const result = user.roundResults?.[roundKey];
        const attemptsUsed = user.roundAttempts?.[roundKey] || 0;

        rounds[roundKey] = {
          score: result ? result.score : null,
          result: result ? result.result : null,
          attemptsLeft: Math.max(MAX_ATTEMPTS - attemptsUsed, 0),
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