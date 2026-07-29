const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../db-sql");

const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.json({ message: "no token provided" });

  const token = auth.split(" ")[1];
  if (!token) return res.json({ message: "Invalid Token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id) {
      req.userId = decoded.id;
      return next();
    }

    if (decoded.username) {
      const pool = getPool();
      const result = await pool.request()
        .input("registerNumber", sql.NVarChar, decoded.username)
        .query("SELECT id FROM Users WHERE registerNumber = @registerNumber");
      if (result.recordset.length === 0) {
        return res.json({ message: "User not found" });
      }
      req.userId = result.recordset[0].id;
      return next();
    }

    return res.json({ message: "invalid token payload" });
  } catch (err) {
    return res.json({ message: "invalid token" });
  }
};

module.exports = authMiddleware;