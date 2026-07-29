require("dotenv").config();
const { connectSQL, getPool, sql } = require("../db-sql");
const bcrypt = require("bcryptjs");

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node scripts/createAdmin.js <email> <password>");
    process.exit(1);
  }

  await connectSQL();
  const pool = getPool();
  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.request()
    .input("email", sql.NVarChar, email)
    .input("password", sql.NVarChar, hashedPassword)
    .query(`INSERT INTO Admins (email, password) VALUES (@email, @password)`);

  console.log(`✅ Admin account created: ${email}`);
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Failed to create admin:", err);
  process.exit(1);
});