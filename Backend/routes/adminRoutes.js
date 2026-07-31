const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../db-sql");
const { getDepartments, getYears, getStudents } = require("../controller/adminController");
const adminAuthMiddleware = require("../midleware/adminAuthMiddleware");

// Admin login — checks the separate Admins table, nothing to do with Users
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = getPool();
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Admins WHERE email = @email");

    const admin = result.recordset[0];
    if (!admin) {
      return res.json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token, admin: { name: admin.name, email: admin.email } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

router.get("/departments", adminAuthMiddleware, getDepartments);
router.get("/years", adminAuthMiddleware, getYears);
router.get("/students", adminAuthMiddleware, getStudents);

module.exports = router;