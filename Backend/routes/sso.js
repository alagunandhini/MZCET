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
      console.log("Decoded token:", decoded);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // Extract user type from token, or infer it from the identifier format
    let userType = decoded.userType || "student";
    const identifier = decoded.username || decoded.email;
    
    // Infer user type if not explicitly provided
    // If identifier looks like an email (contains @), treat as HOD
    // If identifier looks like a register number, treat as student
    if (!decoded.userType) {
      if (identifier && identifier.includes("@")) {
        userType = "hod";
        console.log("Inferred type as HOD (identifier is email):", identifier);
      } else {
        userType = "student";
        console.log("Inferred type as student (identifier is register number):", identifier);
      }
    } else {
      console.log("User type from token:", userType);
    }
    console.log("Final userType:", userType, "Identifier:", identifier);
    const pool = getPool();
    let user = null;
    let userData = null;

    // Route based on user type
    switch (userType.toLowerCase()) {
      case "hod":
        // HOD records - query Admins table by email field
        const hodResult = await pool.request()
          .input("email", sql.NVarChar, identifier)
          .query("SELECT id, email, name FROM Admins WHERE email = @email");
        user = hodResult.recordset[0];
        if (user) {
          userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: "hod",
          };
        }
        break;

      case "student":
        // Check Users table by registerNumber
        const studentResult = await pool.request()
          .input("registerNumber", sql.NVarChar, decoded.username)
          .query("SELECT id, name, registerNumber, department, hasResume, isFirstLogin FROM Users WHERE registerNumber = @registerNumber");
        user = studentResult.recordset[0];
        if (user) {
          userData = {
            id: user.id,
            name: user.name,
            registerNumber: user.registerNumber,
            department: user.department,
            userType: "student",
            hasResume: !!user.hasResume,
            isFirstLogin: user.isFirstLogin,
          };
        }
        break;

      default:
        return res.status(400).json({ success: false, message: `Unsupported user type: ${userType}. Only 'student' and 'hod' are allowed.` });
    }

    if (!user || !userData) {
      return res.status(404).json({ success: false, message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} not found` });
    }

    // Create token with admin flag for HOD users so they can access admin endpoints
    const tokenPayload = { id: user.id, userType: userType.toLowerCase() };
    if (userType.toLowerCase() === "hod") {
      tokenPayload.isAdmin = true;
    }

    const appToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = {
      success: true,
      token: appToken,
      userType: userType.toLowerCase(),
      user: userData,
    };

    res.json(response);
  } catch (err) {
    console.error("SSO ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
