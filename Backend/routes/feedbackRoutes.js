const express = require("express");
const router = express.Router();
const { getFeedback } = require("../controller/feedbackController");
const authMiddleware = require("../midleware/authMiddleware"); 

router.get("/:sessionId", authMiddleware, getFeedback);

module.exports = router;
