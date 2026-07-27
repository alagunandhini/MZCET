// One-time (or re-runnable) script to bulk-import students from the Excel roster.
// Usage:  node scripts/importStudents.js path/to/Student_records.xlsx
// Run this from inside the Backend/ folder.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const User = require("../models/users");

const DEFAULT_PASSWORD = "MZCET";

async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node scripts/importStudents.js path/to/Student_records.xlsx");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

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

      // Handle DateOfBirth whether Excel gives it as a string or a Date object
      let dateOfBirth = "";
      if (row.DateOfBirth) {
        if (row.DateOfBirth instanceof Date) {
          dateOfBirth = row.DateOfBirth.toISOString().split("T")[0]; // YYYY-MM-DD
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
        const existing = await User.findOne({ registerNumber });
        if (existing) {
          totalSkipped++;
          continue;
        }

        await User.create({
          name,
          registerNumber,
          department,
          sprNo,
          year,
          section,
          gender,
          dateOfBirth,
          password: hashedDefaultPassword,
          isFirstLogin: true,
        });

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

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Import script crashed:", err);
  process.exit(1);
});