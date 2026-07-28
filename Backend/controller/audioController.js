const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { getPool, sql } = require("../db-sql");

exports.processAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file missing" });
    }

    // Pull the logged-in user's id from wherever your auth middleware puts it.
    // I don't have your middleware code, so this checks the common spots —
    // once you confirm which one is actually set, you can trim this down to
    // just that one line.
    const userId = req.userId || req.user?.id || req.user?.userId;

    if (!userId || isNaN(Number(userId))) {
      console.error("processAudio: missing/invalid userId on request:", userId);
      return res.status(401).json({ error: "Invalid or missing user session" });
    }

    const audioPath = path.join(__dirname, "..", req.file.path);
    const question = req.body.question;
    const sessionId = req.body.sessionId;
    const round = req.body.round;
    const mimeType = req.body.mimeType || "audio/webm";

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID missing" });
    }

    if (!round) {
      return res.status(400).json({ error: "Round missing" });
    }

    console.log("🎤 Audio received:", audioPath);
    console.log("❓ Question:", question);

    const audioBuffer = fs.readFileSync(audioPath);

    const response = await axios.post(
      "https://api.deepgram.com/v1/listen",
      audioBuffer,
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": mimeType,
        },
      }
    );

    const transcript =
      response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    console.log("📝 Transcript:", transcript);

    const pool = getPool();

    // Find the session row, or create it if this is the first answer for it —
    // same pattern as the old findOne()/new InterviewSession() in MongoDB.
    let sessionResult = await pool.request()
      .input("sessionId", sql.NVarChar, sessionId)
      .query("SELECT id FROM InterviewSessions WHERE sessionId = @sessionId");

    let sessionRowId;

    if (sessionResult.recordset.length === 0) {
      const insertSession = await pool.request()
        .input("sessionId", sql.NVarChar, sessionId)
        .input("userId", sql.Int, userId)
        .input("round", sql.NVarChar, round)
        .query(`
          INSERT INTO InterviewSessions (sessionId, userId, round)
          OUTPUT INSERTED.id
          VALUES (@sessionId, @userId, @round)
        `);
      sessionRowId = insertSession.recordset[0].id;
    } else {
      sessionRowId = sessionResult.recordset[0].id;
    }

    // Dedupe: if this exact question already has an answer for this session,
    // UPDATE the transcript instead of inserting a duplicate row — handles
    // retries after a dropped connection the same way the Mongo version did.
    const existingAnswer = await pool.request()
      .input("sessionRowId", sql.Int, sessionRowId)
      .input("questionText", sql.NVarChar, question)
      .input("round", sql.NVarChar, round)
      .query(`
        SELECT id FROM Answers 
        WHERE sessionId = @sessionRowId AND questionText = @questionText AND round = @round
      `);

    if (existingAnswer.recordset.length > 0) {
      await pool.request()
        .input("id", sql.Int, existingAnswer.recordset[0].id)
        .input("transcript", sql.NVarChar, transcript)
        .query("UPDATE Answers SET transcript = @transcript WHERE id = @id");
    } else {
      await pool.request()
        .input("sessionRowId", sql.Int, sessionRowId)
        .input("questionText", sql.NVarChar, question)
        .input("transcript", sql.NVarChar, transcript)
        .input("round", sql.NVarChar, round)
        .query(`
          INSERT INTO Answers (sessionId, questionText, transcript, round)
          VALUES (@sessionRowId, @questionText, @transcript, @round)
        `);
    }

    fs.unlink(audioPath, () => {});

    return res.json({
      success: true,
      message: "Answer saved",
      transcript,
    });
  } catch (err) {
    console.error("Deepgram Error:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
};