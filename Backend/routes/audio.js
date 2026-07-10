const express = require("express");
const router = express.Router();
const multer = require("multer");
const { processAudio } = require("../controller/audioController");

// store uploaded audio
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// POST: audio + question
router.post("/", upload.single("audio"), processAudio);

module.exports = router;

