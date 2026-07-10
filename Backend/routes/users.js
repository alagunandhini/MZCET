var express = require('express');
var router = express.Router();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/users");

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

  const {email,password} =req.body;

  const user= await User.findOne({email});

   if(!user) return res.json({message:"Invalid Email"});

   // compare User entered password vs DB saved password
   const isCompare= await bcrypt.compare(password,user.password);

   if(!isCompare) return res.json({message:"Invalid Email or Password"});

   // create token for future acess
   const token = await jwt.sign(
    {id:user._id},
    process.env.JWT_SECRET,
    {expiresIn:"1d"},
   )

  return  res.json({
    message:"login Sucessful",
    token,
    user:{
      id:user._id,
      name:user.name,
      email:user.email
    }
   });

  }catch(err){
      console.log("LOGIN ERROR:", err);
   return  res.json({
      message:"login failed",
     

    })
  }

  






})


module.exports = router;
