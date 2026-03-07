

const db=require("../db")
const jwt =require("jsonwebtoken")
const bcrypt =require("bcrypt")
const crypto = require("crypto")
const sendPasswordResetEmail = require("../utils/sendEmail")
const { ConflictError, UnauthorizedError } = require("../utils/errors")

//helper functions to generate tokens
const generateAccessToken =(user_id) =>{
    return jwt.sign({user_id},process.env.JWT_SECRET,{expiresIn:"1h"})
}

const generateRefreshToken =(user_id)=>{
    return jwt.sign({user_id},process.env.JWT_REFRESH_SECRET,{expiresIn:"7d"})
}

//Register
const register = async (req, res,next) => {
    try {
       
        const {name,email,password}=req.body
        //check existing user
        const existingUser= await db.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        )
        if (existingUser.rows.length >0){
            throw new ConflictError("User already exists")
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
         

         //user object
         res.json({
             accessToken,
             refreshToken,
             user: {
            user_id: newUser.rows[0].user_id,
            name: newUser.rows[0].name,
            email: newUser.rows[0].email
        }
        })
    } catch (error) {
        next(error) //  pass to error handler
    }
}

//LOGIN


const login = async (req, res,next) => {
    
    
    
    try {
        const {email,password} =req.body
        //check if user exists
        const user= await db.query(
            "SELECT * FROM users WHERE email= $1",
            [email]
        )
        
        if (user.rows.length ===0){
            throw new UnauthorizedError("Invalid credentials")
        }
            //compare passwords
            const validPassword = await bcrypt.compare(
                password,
                user.rows[0].password
            )
            if (!validPassword){
                throw new UnauthorizedError("Invalid credentials")
            }

            const user_id = user.rows[0].user_id
            const accessToken = generateAccessToken(user_id)
            const refreshToken = generateRefreshToken(user_id)

            //save refresh token to database
            await db.query(
                "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES($1,$2, NOW() + INTERVAL '7 days')",
                [user_id, refreshToken]
            )
           
            //user object
            res.json({
            accessToken,
            refreshToken,
            user: {
                user_id: user.rows[0].user_id,
                name: user.rows[0].name,
                email: user.rows[0].email
            }
            })
        
    } catch (error) {
        next(error) //  pass to error handler
    }
}

//Refresh Token -get new acces token
const refreshToken= async (req,res,next) =>{
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
        const accessToken = generateAccessToken(verified.user_id)
        res.json({accessToken})
    } catch (error) {
        console.log(error.message)
        res.status(403).json("Invalid or expired refresh token")
    }
}
//Logout -delete refresh token from database
const logout =async(req,res,next)=>{
    try {
        const {token}=req.body
        await db.query(
          "DELETE FROM refresh_tokens WHERE token = $1",
           [token]  
        )
        res.json({message: "Logged out successfully"})
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}



// FORGOT PASSWORD
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    // check if user exists
    const user = await db.query(
      "SELECT * FROM users WHERE email = $1", [email]
    )
    if (user.rows.length === 0) {
      // don't reveal if email exists or not for security
      return res.json({ message: "If that email exists you will receive a reset link" })
    }

    // generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // delete any existing token for this user
    await db.query(
      "DELETE FROM password_reset_tokens WHERE user_id = $1",
      [user.rows[0].user_id]
    )

    // save new token to database
    await db.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES($1,$2,$3)",
      [user.rows[0].user_id, resetToken, expiresAt]
    )

    // send email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    await sendPasswordResetEmail(email, resetUrl)

    res.json({ message: "If that email exists you will receive a reset link" })
  } catch (error) {
    next(error)
  }
}

// RESET PASSWORD
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body

    // find token in database
    const resetToken = await db.query(
      "SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    )
    if (resetToken.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // update password
    await db.query(
      "UPDATE users SET password = $1 WHERE user_id = $2",
      [hashedPassword, resetToken.rows[0].user_id]
    )

    // delete used token
    await db.query(
      "DELETE FROM password_reset_tokens WHERE token = $1",
      [token]
    )

    res.json({ message: "Password reset successful" })
  } catch (error) {
    next(error)
  }
}

//update profile

const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body
    const user_id = req.user_id

    // get current user
    const user = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    )
    if (user.rows.length === 0) {
      throw new UnauthorizedError("User not found")
    }

    let updatedName = user.rows[0].name
    let updatedPassword = user.rows[0].password

    // update name if provided
    if (name) {
      updatedName = name
    }

    // update password if provided
    if (newPassword) {
      // verify current password first
      if (!currentPassword) {
        return res.status(400).json({
          status: "fail",
          statusCode: 400,
          message: "Current password is required to set a new password"
        })
      }

      const isMatch = await bcrypt.compare(currentPassword, user.rows[0].password)
      if (!isMatch) {
        return res.status(400).json({
          status: "fail",
          statusCode: 400,
          message: "Current password is incorrect"
        })
      }

      updatedPassword = await bcrypt.hash(newPassword, 10)
    }

    // update user in database
    const updatedUser = await db.query(
      "UPDATE users SET name = $1, password = $2 WHERE user_id = $3 RETURNING user_id, name, email",
      [updatedName, updatedPassword, user_id]
    )

    res.json({
      message: "Profile updated successfully",
      user: updatedUser.rows[0]
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, updateProfile }
