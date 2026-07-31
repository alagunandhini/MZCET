var express = require('express');
var router = express.Router();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/users");
const authMiddleware = require("../midleware/authMiddleware");
const { getPool, sql } = require("../db-sql");

// sign up endpoint 
router.post("/signup",async(req ,res)=>{
 try{

  const {name,email,password} =req.body;

  const userExist= await User.findOne({email});

  if(userExist) return res.status(400).json({message:"user Already exist"});

  const hashedPassword=await bcrypt.hash(password,10);

  const user=await User.create(
    {
      name,
      email,
      password:hashedPassword,
    }
  )
  
  return res.json({
    message:"signup Succesfull",
    user:{id:user._id,name:user.name, email:user.email}
  })


}catch(err){
 return  res.json({
    message: "signup failed"
  })
 };
});



//login endpoint
router.post("/login",async(req,res)=>{
 
  try{

  const {registerNumber,password} =req.body;

  const pool = getPool();
  const result = await pool.request()
    .input("registerNumber", sql.NVarChar, registerNumber)
    .query("SELECT * FROM Users WHERE registerNumber = @registerNumber");

  const user = result.recordset[0];

   if(!user) return res.json({message:"Invalid Register Number"});

   // compare User entered password vs DB saved password
   const isCompare= await bcrypt.compare(password,user.password);

   if(!isCompare) return res.json({message:"Invalid Register Number or Password"});

   // create token for future acess
   const token = await jwt.sign(
    {id:user.id},
    process.env.JWT_SECRET,
    {expiresIn:"1d"},
   )

  return  res.json({
    message:"login Sucessful",
    token,
    hasResume: !!user.hasResume, 
    isFirstLogin: user.isFirstLogin,
    user:{
      id:user.id,
      name:user.name,
      registerNumber:user.registerNumber,
      department:user.department
    }
   });

  }catch(err){
      console.log("LOGIN ERROR:", err);
   return  res.json({
      message:"login failed",
     

    })
  }

})

router.post("/reset-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const pool = getPool();
    await pool.request()
      .input("id", sql.Int, req.userId)
      .input("password", sql.NVarChar, hashedPassword)
      .query(`
        UPDATE Users
        SET password = @password, isFirstLogin = 0
        WHERE id = @id
      `);

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});


// Each round stores 45 questions (3 sets of 15 — one set per attempt).
// This tells us which 15-question slice belongs to a given attempt number.
const QUESTIONS_PER_ATTEMPT_SET = 15;

router.get("/resume-status", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();

    const userResult = await pool.request()
      .input("id", sql.Int, req.userId)
      .query("SELECT * FROM Users WHERE id = @id");

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const questionsResult = await pool.request()
      .input("id", sql.Int, req.userId)
      .query("SELECT * FROM Questions WHERE userId = @id ORDER BY round, questionOrder");

    const completedResult = await pool.request()
      .input("id", sql.Int, req.userId)
      .query("SELECT round FROM CompletedRounds WHERE userId = @id");

    const attemptsResult = await pool.request()
      .input("id", sql.Int, req.userId)
      .query("SELECT round, attemptsUsed FROM RoundAttempts WHERE userId = @id");

    // Reshape into { Round1: 2, Round2: 0, ... } first — the question
    // slicing below needs this to know which attempt-set to serve.
    const roundAttempts = {};
    for (const row of attemptsResult.recordset) {
      roundAttempts[row.round] = row.attemptsUsed;
    }

    // Reshape flat SQL rows into { Round1: { name, questions: [{ q }] }, ... },
    // but only keep the 15-question slice matching this round's current
    // attempt number. attemptsUsed=0 -> questionOrder 1-15 (attempt 1),
    // attemptsUsed=1 -> 16-30 (attempt 2), attemptsUsed=2+ -> 31-45 (attempt 3).
    // Without this, every attempt saw the same first 15 (or all 45) questions.
    //
    // IMPORTANT: clamp the slice INDEX to a max of 2 (there are only 3 sets,
    // questionOrder 1-45). roundAttempts[row.round] itself is left untouched
    // for the "Attempts Left"/"Failed" display below — only the value used to
    // pick a question slice is clamped. Without this clamp, once a round hit
    // attemptsUsed=3 (all attempts used), setStart became 46 — past every
    // stored row — so zero rows matched and the round's key never got added
    // to `questions` at all, making it disappear from the dashboard entirely
    // instead of correctly showing as "Failed" with 0 attempts left.
    const questions = {};
    for (const row of questionsResult.recordset) {
      const attemptsUsed = roundAttempts[row.round] || 0;
      const sliceIndex = Math.min(attemptsUsed, 2);
      const setStart = sliceIndex * QUESTIONS_PER_ATTEMPT_SET + 1;
      const setEnd = setStart + QUESTIONS_PER_ATTEMPT_SET - 1;

      if (row.questionOrder < setStart || row.questionOrder > setEnd) {
        continue; // belongs to a different attempt's set — skip it
      }

      if (!questions[row.round]) {
        questions[row.round] = { name: row.roundName, questions: [] };
      }
      questions[row.round].questions.push({ q: row.questionText });
    }

    res.json({
      success: true,
      hasResume: !!user.hasResume,
      resumeText: user.resumeText,
      questions,
      completedRounds: completedResult.recordset.map(r => r.round),
      roundAttempts,
    });

  } catch (err) {
    console.error("RESUME STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});

module.exports = router;