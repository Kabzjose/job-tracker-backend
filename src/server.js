require("dotenv").config()

const express=require("express")
const cors=require("cors")
const authRoutes=require("./routes/auth")
const jobsRoutes=require("./routes/jobs")
const errorHandler = require("./middleware/errorHandler")

const app=express()

//https://job-tracker-wheat-kappa.vercel.app http://localhost:5173
app.use(cors({
  origin: "http://localhost:5173 ",
  credentials: true
}))
app.use(express.json())

app.use("/api/auth",authRoutes)
app.use("/api/jobs",jobsRoutes)
app.use(errorHandler)

app.get("/", (req,res)=>{
    res.send("Job Tracker API running")
})
app.listen(5000,()=>{
    console.log("server running on port 5000")
})