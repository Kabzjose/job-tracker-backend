require("dotenv").config()

const express=require("express")
const cors=require("cors")
const authRoutes=require("./routes/auth")
const jobsRoutes=require("./routes/jobs")

const app=express()


app.use(cors())
app.use(express.json())

app.use("/api/auth",authRoutes)
app.use("/api/jobs",jobsRoutes)

app.get("/", (req,res)=>{
    res.send("Job Tracker API running")
})
app.listen(5000,()=>{
    console.log("server running on port 5000")
})