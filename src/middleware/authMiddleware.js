const jwt =require("jsonwebtoken")

module.exports=function(req,res,next){
    try {
        //get token from header
        const token=req.header("Authorization")
               if (!token){
            return res.status(401).json("No token, authorization denied")
        }
        //verify token
        const verified=jwt.verify(token.replace("Bearer ",""),process.env.JWT_SECRET)
        req.user_id = verified.user_id
        console.log("Authenticated user ID:", req.user_id)
        next()//allows request to continue
    } catch (error) {
        res.status(401).json("Invalid Token")
    }
}