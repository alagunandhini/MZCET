const path = require("path");
const fs = require("fs");
const axios = require("axios");
const InterviewSession = require("../models/InterviewSession");

exports.processAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file missing" });
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
          "Content-Type":mimeType,
        },
      }
    );

    const transcript =
      response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    console.log("📝 Transcript:", transcript);

    let session = await InterviewSession.findOne({ sessionId });

    if (!session) {
      session = new InterviewSession({
        sessionId,
        answers: [],
      });
    }

    session.answers.push({
      question,
      transcript,
      round,
    });

    await session.save();

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