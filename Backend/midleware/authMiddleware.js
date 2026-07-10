const jwt=require("jsonwebtoken");

const authMiddleware=(req,res,next)=>{

    const auth=req.headers.authorization;
   if(!auth) return res.json({message:"no token provided"});
   
    const token=auth.split(" ")[1];
     if(!auth) return res.json({message:"Invalid Token format"});


    try{
        // verify the user token
        const decoded= jwt.verify(token,process.env.JWT_SECRET);
        req.userId=decoded.id;
        next();

    }catch(err){
        res.json({message:"invalid token"})
    }


}

module.exports=authMiddleware;