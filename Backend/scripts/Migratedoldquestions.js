// One-time migration: finds every user whose stored questions are still in
// the OLD format (15 per round, from before the 45-question/3-attempt-set
// change) and regenerates their questions to the new 45-per-round format —
// reusing their resumeText/jobDescription already saved in the Users table,
// so nobody has to manually re-upload their resume.
//
// Run once from your project root:
//   node scripts/migrateOldQuestions.js
//
// IMPORTANT — Gemini free-tier rate limit is 20 requests/minute, and this
// script makes 4 calls per affected user (one per round, same as a normal
// upload). There's a delay built in between users to avoid hitting that
// limit again — expect this to take a while if many users are affected.

const { getPool, sql } = require("../db-sql");
const { ROUND_DEFS, generateRound } = require("../controller/analyzeController");

const QUESTIONS_PER_ROUND_EXPECTED = 45;
const DELAY_BETWEEN_USERS_MS = 15000; // ~4 users/min, safely under the 20/min cap (4 calls each)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findAffectedUserIds(pool) {
  const result = await pool.request().query(`
    SELECT u.id, u.registerNumber, u.resumeText, u.jobDescription
    FROM Users u
    WHERE u.hasResume = 1
  `);

  const affected = [];

  for (const user of result.recordset) {
    const countsResult = await pool.request()
      .input("id", sql.Int, user.id)
      .query("SELECT round, COUNT(*) AS cnt FROM Questions WHERE userId = @id GROUP BY round");

    const counts = {};
    for (const row of countsResult.recordset) {
      counts[row.round] = row.cnt;
    }

    // Affected if any round is missing or has fewer than 45 questions.
    const isAffected = ROUND_DEFS.some(
      (def) => (counts[def.key] || 0) !== QUESTIONS_PER_ROUND_EXPECTED
    );

    if (isAffected) {
      affected.push(user);
    }
  }

  return affected;
}

async function regenerateForUser(pool, user) {
  console.log(`\n--- Regenerating questions for user ${user.id} (${user.registerNumber}) ---`);

  if (!user.resumeText) {
    console.warn(`  Skipping — no resumeText stored for user ${user.id}, cannot regenerate.`);
    return { userId: user.id, status: "skipped-no-resume" };
  }

  const parsedQuestions = {};

  for (const roundDef of ROUND_DEFS) {
    try {
      parsedQuestions[roundDef.key] = await generateRound(
        roundDef,
        user.resumeText,
        user.jobDescription
      );
      console.log(`  ${roundDef.key}: generated ${parsedQuestions[roundDef.key]?.questions?.length || 0} questions`);
    } catch (err) {
      console.error(`  FAILED generating ${roundDef.key} for user ${user.id}:`, err.message);
      return { userId: user.id, status: "failed", error: err.message };
    }
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    // Same wipe-and-reinsert this user's own resume upload would have done.
    // This resets their attempt/progress history for this round set — there
    // is no way to keep old attempt history aligned with a brand new
    // question set, so this is treated the same as "starting fresh."
    await transaction.request().input("id", sql.Int, user.id).query("DELETE FROM Questions WHERE userId = @id");
    await transaction.request().input("id", sql.Int, user.id).query("DELETE FROM CompletedRounds WHERE userId = @id");
    await transaction.request().input("id", sql.Int, user.id).query("DELETE FROM RoundResults WHERE userId = @id");
    await transaction.request().input("id", sql.Int, user.id).query("DELETE FROM RoundAttempts WHERE userId = @id");
    await transaction.request().input("id", sql.Int, user.id).query("DELETE FROM RoundTimeTaken WHERE userId = @id");

    for (const roundKey of Object.keys(parsedQuestions)) {
      const round = parsedQuestions[roundKey];
      const roundName = round?.name || "";
      const questions = round?.questions || [];

      for (let i = 0; i < questions.length; i++) {
        await transaction.request()
          .input("userId", sql.Int, user.id)
          .input("round", sql.NVarChar, roundKey)
          .input("roundName", sql.NVarChar, roundName)
          .input("questionText", sql.NVarChar, questions[i].q || "")
          .input("questionOrder", sql.Int, i + 1)
          .query(`
            INSERT INTO Questions (userId, round, roundName, questionText, questionOrder)
            VALUES (@userId, @round, @roundName, @questionText, @questionOrder)
          `);
      }
    }

    await transaction.commit();
    console.log(`  Done — user ${user.id} now has the new 45-question format.`);
    return { userId: user.id, status: "success" };
  } catch (txErr) {
    try { await transaction.rollback(); } catch (_) {}
    console.error(`  DB write failed for user ${user.id}:`, txErr.message);
    return { userId: user.id, status: "failed", error: txErr.message };
  }
}

async function main() {
  const pool = getPool();

  console.log("Scanning for users still on the old 15-question format...");
  const affected = await findAffectedUserIds(pool);

  console.log(`Found ${affected.length} affected user(s).`);
  if (affected.length === 0) {
    console.log("Nothing to do.");
    process.exit(0);
  }

  const results = [];

  for (let i = 0; i < affected.length; i++) {
    const user = affected[i];
    const result = await regenerateForUser(pool, user);
    results.push(result);

    // Don't hit the Gemini rate limit again — wait between users.
    if (i < affected.length - 1) {
      console.log(`  Waiting ${DELAY_BETWEEN_USERS_MS / 1000}s before next user...`);
      await sleep(DELAY_BETWEEN_USERS_MS);
    }
  }

  console.log("\n=== MIGRATION SUMMARY ===");
  for (const r of results) {
    console.log(`User ${r.userId}: ${r.status}${r.error ? ` (${r.error})` : ""}`);
  }

  const failed = results.filter((r) => r.status !== "success");
  if (failed.length > 0) {
    console.log(`\n${failed.length} user(s) failed or were skipped — re-run this script to retry them (already-migrated users will be skipped automatically).`);
  } else {
    console.log("\nAll affected users migrated successfully.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Migration script crashed:", err);
  process.exit(1);
});