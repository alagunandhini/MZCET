const express = require("express");
const router = express.Router();
const { endSession, terminateRound } = require("../controller/sessionController");
const authMiddleware=require("../midleware/authMiddleware");

router.post("/end-session", authMiddleware,endSession);
router.post("/terminate-round", authMiddleware, terminateRound);


module.exports = router;