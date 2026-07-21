const express = require("express");
const router = express.Router();
const { endSession } = require("../controller/sessionController");
const authMiddleware=require("../midleware/authMiddleware");

router.post("/end-session", authMiddleware,endSession);


module.exports = router;
