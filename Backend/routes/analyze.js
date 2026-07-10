var express = require('express');
var router = express.Router();
var analyzeResume=require('..//controller/analyzeController.js');
const authMiddleware=require("..//midleware/authMiddleware.js")



router.post("/", authMiddleware,analyzeResume);

module.exports = router;
