const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../db-sql");

router.post("/api/auth/sso", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const pool = getPool();
    const result = await pool.request()
      .input("registerNumber", sql.NVarChar, decoded.username)
      .query("SELECT id, name, registerNumber, department, hasResume, isFirstLogin FROM Users WHERE registerNumber = @registerNumber");

    const user = result.recordset[0];
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const appToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token: appToken,
      user: {
        id: user.id,
        name: user.name,
        registerNumber: user.registerNumber,
        department: user.department,
      },
      hasResume: !!user.hasResume,
      isFirstLogin: user.isFirstLogin,
    });
  } catch (err) {
    console.error("SSO ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
