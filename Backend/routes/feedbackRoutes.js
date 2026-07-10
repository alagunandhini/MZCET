const express = require("express");
const router = express.Router();
const { getFeedback } = require("../controller/feedbackController");

router.get("/:sessionId", getFeedback);

module.exports = router;
