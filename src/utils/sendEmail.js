const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"Job Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Reset your password</h2>
        <p style="color: #64748b;">
          You requested a password reset for your Job Tracker account.
          Click the button below to reset your password.
        </p>
        <a href="${resetUrl}" 
          style="display: inline-block; background: #f59e0b; color: #0f172a; 
          font-weight: bold; padding: 12px 24px; border-radius: 8px; 
          text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 12px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `
  }
  await transporter.sendMail(mailOptions)
}

module.exports = sendPasswordResetEmail