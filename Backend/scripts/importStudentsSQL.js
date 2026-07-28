// One-time (or re-runnable) script to bulk-import students from the Excel roster
// directly into SQL Server.
// Usage:  node scripts/importStudentsSQL.js path/to/Student_records.xlsx
// Run this from inside the Backend/ folder.

require("dotenv").config();
const sql = require("mssql");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");

const DEFAULT_PASSWORD = "MZCET";

const config = {
  server: process.env.SQL_SERVER,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node scripts/importStudentsSQL.js path/to/Student_records.xlsx");
    process.exit(1);
  }

  const pool = await sql.connect(config);
  console.log("✅ Connected to SQL Server");

  const hashedDefaultPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const workbook = XLSX.readFile(filePath);

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`\n--- Processing sheet: ${sheetName} (${rows.length} rows) ---`);

    for (const row of rows) {
      const registerNumber = String(row.Register_No || "").trim();
      const name = String(row.Student_Name || "").trim();
      const department = String(row.Dept || sheetName).trim();
      const sprNo = String(row.SPR_No || "").trim();
      const year = String(row.Year || "").trim();
      const section = String(row.Sec || "").trim();
      const gender = String(row.Gender || "").trim();

      let dateOfBirth = "";
      if (row.DateOfBirth) {
        if (row.DateOfBirth instanceof Date) {
          dateOfBirth = row.DateOfBirth.toISOString().split("T")[0];
        } else {
          dateOfBirth = String(row.DateOfBirth).trim();
        }
      }

      if (!registerNumber || !name) {
        console.warn("⚠️  Skipping row with missing register number or name:", row);
        totalSkipped++;
        continue;
      }

      try {
        // Check if already exists
        const existing = await pool.request()
          .input("registerNumber", sql.NVarChar, registerNumber)
          .query("SELECT id FROM Users WHERE registerNumber = @registerNumber");

        if (existing.recordset.length > 0) {
          totalSkipped++;
          continue;
        }

        await pool.request()
          .input("name", sql.NVarChar, name)
          .input("registerNumber", sql.NVarChar, registerNumber)
          .input("department", sql.NVarChar, department)
          .input("sprNo", sql.NVarChar, sprNo)
          .input("year", sql.NVarChar, year)
          .input("section", sql.NVarChar, section)
          .input("gender", sql.NVarChar, gender)
          .input("dateOfBirth", sql.NVarChar, dateOfBirth)
          .input("password", sql.NVarChar, hashedDefaultPassword)
          .query(`
            INSERT INTO Users (name, registerNumber, department, sprNo, year, section, gender, dateOfBirth, password, isFirstLogin, hasResume)
            VALUES (@name, @registerNumber, @department, @sprNo, @year, @section, @gender, @dateOfBirth, @password, 1, 0)
          `);

        totalCreated++;
      } catch (err) {
        console.error(`❌ Failed to create ${registerNumber} (${name}):`, err.message);
        totalFailed++;
      }
    }
  }

  console.log("\n========== IMPORT SUMMARY ==========");
  console.log("Created:", totalCreated);
  console.log("Skipped (already existed / bad row):", totalSkipped);
  console.log("Failed:", totalFailed);
  console.log("=====================================");

  await pool.close();
}

run().catch((err) => {
  console.error("Import script crashed:", err);
  process.exit(1);
});