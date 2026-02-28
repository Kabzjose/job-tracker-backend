const express = require("express")
const router = express.Router()
const { register, login,refreshToken,logout } = require("../controllers/authController")
const { validate, registerSchema ,loginSchema} = require("../middleware/validate")

// Define routes for authentication
router.post("/register", validate(registerSchema), register)
router.post("/login", validate(loginSchema), login)
router.post("/refresh", refreshToken)
router.post("/logout", logout)



module.exports = router