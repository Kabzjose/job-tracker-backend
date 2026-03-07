const express = require("express")
const router = express.Router()
const { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require("../middleware/validate")
const { register, login, refreshToken, logout, forgotPassword, resetPassword } = require("../controllers/authController")

// Define routes for authentication
router.post("/register", validate(registerSchema), register)
router.post("/login", validate(loginSchema), login)
router.post("/refresh", refreshToken)
router.post("/logout", logout)
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword)
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword)


module.exports = router