const express = require("express");
const router = express.Router();
const { endSession } = require("../controller/sessionController");

router.post("/end-session", endSession);


module.exports = router;
