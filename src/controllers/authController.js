

const db=require("../db")
const jwt =require("jsonwebtoken")
const bcrypt =require("bcrypt")

//helper functions to generate tokens
const generateAccessToken =(user_id) =>{
    return jwt.sign({user_id},process.env.JWT_SECRET,{expiresIn:"1h"})
}

const generateRefreshToken =(user_id)=>{
    return jwt.sign({user_id},process.env.JWT_REFRESH_SECRET,{expiresIn:"7d"})
}

//Register
const register = async (req, res) => {
    try {
       
        const {name,email,password}=req.body
        //check existing user
        const existingUser= await db.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        )
        if (existingUser.rows.length >0){
            return res.status(400).json("User already exists")
        }
         //hash password
        const hashedPassword= await bcrypt.hash(password,10)
        const newUser= await db.query(
            "INSERT INTO USERS (name,email,password) VALUES($1,$2,$3) RETURNING *",
            [name,email,hashedPassword]
        )

        const user_id=newUser.rows[0].user_id
        const accessToken = generateAccessToken(user_id)
        const refreshToken= generateRefreshToken(user_id)

        //save refresh token to database
        await db.query(
            "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES($1,$2, NOW() + INTERVAL '7 days')",
            [user_id,refreshToken]
        )
         res.json({accessToken,refreshToken})
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}

//LOGIN


const login = async (req, res) => {
    
    
    const {email,password} =req.body
    try {
        //check if user exists
        const user= await db.query(
            "SELECT * FROM users WHERE email= $1",
            [email]
        )
        
        if (user.rows.length ===0){
            return res.status(401).json("Invalid email or password")
        }
            //compare passwords
            const validPassword = await bcrypt.compare(
                password,
                user.rows[0].password
            )
            if (!validPassword){
                return res.status(401).json("Invalid email or password")
            }

            const user_id = user.rows[0].user_id
            const accessToken = generateAccessToken(user_id)
            const refreshToken = generateRefreshToken(user_id)

            //save refresh token to database
            await db.query(
                "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES($1,$2, NOW() + INTERVAL '7 days')",
                [user_id, refreshToken]
            )
            res.json({accessToken,refreshToken})
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}

//Refresh Token -get new acces token
const refreshToken= async (req,res) =>{
    try {
        const {token}=req.body
        if(!token){
            return res.status(401).json("Refresh token required")
        }
        //check if token exists in database and is not expired
        const storedToken =await db.query(
            "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
            [token]
        )
        if(storedToken.rows.length===0){
            return res.status(403).json("Invalid or expired refresh token")
        }
        //verify the token
        const verified=jwt.verify(token,process.env.JWT_REFRESH_SECRET)

        //Generate new access token
        const accessToken = generateAccesToken(verified.user_id)
        res.json({accessToken})
    } catch (error) {
        console.log(error.message)
        res.status(403).json("Invalid or expired refresh token")
    }
}
//Logout -delete refresh token from database
const logout =async(req,res)=>{
    try {
        const {token}=req.body
        await db.query(
          "DELETE FROM refresh_tokens WHERE token = $1",
           [token]  
        )
        res.json(error.message)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}

module.exports={register,login,refreshToken,logout}
