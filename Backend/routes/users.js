var express = require('express');
var router = express.Router();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/users");
const authMiddleware = require("../midleware/authMiddleware");

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

  const user= await User.findOne({registerNumber});

   if(!user) return res.json({message:"Invalid Register Number"});

   // compare User entered password vs DB saved password
   const isCompare= await bcrypt.compare(password,user.password);

   if(!isCompare) return res.json({message:"Invalid Register Number or Password"});

   // create token for future acess
   const token = await jwt.sign(
    {id:user._id},
    process.env.JWT_SECRET,
    {expiresIn:"1d"},
   )

  return  res.json({
    message:"login Sucessful",
    token,
    hasResume: !!user.resumeText, 
    isFirstLogin: user.isFirstLogin,
    user:{
      id:user._id,
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

    await User.findByIdAndUpdate(req.userId, {
      password: hashedPassword,
      isFirstLogin: false,
    });

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



router.get("/resume-status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.json({
      success: true,
      hasResume: !!user.resumeText,
      resumeText: user.resumeText,
      questions: user.questions,
      completedRounds: user.completedRounds,
      roundAttempts: user.roundAttempts,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});


module.exports = router;
