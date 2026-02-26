

const db=require("../db")
const jwt =require("jsonwebtoken")
const bcrypt =require("bcrypt")

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
         res.json(newUser.rows[0])
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

            //create token
            const token =jwt.sign(
                {user_id: user.rows[0].user_id},
                process.env.JWT_SECRET,
                {expiresIn:"24h"}
            )
            res.json({token})
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}

module.exports={register,login}
