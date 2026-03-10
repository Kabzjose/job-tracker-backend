require("dotenv").config()
const { Pool } = require("pg")


console.log("DB URL:", process.env.DATABASE_URL)
module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // ← required for Supabase
  }
})