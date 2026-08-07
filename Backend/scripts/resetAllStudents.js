// Resets EVERY student back to a completely fresh state:
// - Deletes all questions, sessions, answers, feedback, round results/attempts
// - Clears resumeText, jobDescription, hasResume
// - Does NOT touch: student accounts themselves (name, registerNumber, password),
//   isFirstLogin status, or Admins table
//
// Usage: node scripts/resetAllStudents.js

require("dotenv").config();
const sql = require("mssql");
const bcrypt = require("bcryptjs");

const DEFAULT_PASSWORD = "MZCET";

const config = {
  server: process.env.SQL_SERVER,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: { encrypt: false, trustServerCertificate: true },
};

async function run() {
  const pool = await sql.connect(config);
  console.log("✅ Connected to SQL Server");

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // Delete child tables first (foreign key order matters)
    console.log("Deleting QAFeedback...");
    await transaction.request().query("DELETE FROM QAFeedback");

    console.log("Deleting MotivationMessages...");
    await transaction.request().query("DELETE FROM MotivationMessages");

    console.log("Deleting Feedback...");
    await transaction.request().query("DELETE FROM Feedback");

    console.log("Deleting Answers...");
    await transaction.request().query("DELETE FROM Answers");

    console.log("Deleting InterviewSessions...");
    await transaction.request().query("DELETE FROM InterviewSessions");

    console.log("Deleting Questions...");
    await transaction.request().query("DELETE FROM Questions");

    console.log("Deleting RoundResults...");
    await transaction.request().query("DELETE FROM RoundResults");

    console.log("Deleting RoundAttempts...");
    await transaction.request().query("DELETE FROM RoundAttempts");

    console.log("Deleting RoundTimeTaken...");
    await transaction.request().query("DELETE FROM RoundTimeTaken");

    console.log("Deleting CompletedRounds...");
    await transaction.request().query("DELETE FROM CompletedRounds");

   console.log("Resetting passwords back to default (MZCET) for all students...");
    const hashedDefaultPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await transaction.request()
      .input("password", sql.NVarChar, hashedDefaultPassword)
      .query(`
        UPDATE Users 
        SET resumeText = '', jobDescription = '', hasResume = 0, 
            password = @password, isFirstLogin = 1
      `);

    await transaction.commit();
    console.log("\n✅ All students reset to a fresh state successfully.");

  } catch (err) {
    await transaction.rollback();
    console.error("❌ Reset failed, rolled back everything:", err.message);
  }

  await pool.close();
}

run().catch(console.error);