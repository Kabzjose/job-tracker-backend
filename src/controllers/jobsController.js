
const db = require("../db")


//GET jobs for loggedin user
const getJobs = async (req, res) => {
    try {

        const jobs = await db.query(
            "SELECT * FROM jobs WHERE user_id=$1",
            [req.user_id]
        )
        res.json(jobs.rows)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}

//create a job
const addJob = async (req, res) => {
    try {
        const { title, company, location, date_applied, status, } = req.body
        const newJob = await db.query(
            "INSERT INTO jobs (user_id,title,company,location,date_applied,status) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
            [req.user_id, title, company, location, date_applied, status]
        )
        console.log("BODY:", req.body)
        console.log("USER ID:", req.user_id)
        res.json(newJob.rows[0])

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }

}

//update jobs
const updateJob = async (req, res) => {
    try {
        const { title, company, location, date_applied, status, } = req.body
        const { id } = req.params//job id
        const updatedJob = await db.query(
            "UPDATE jobs SET title=$1,company=$2,location=$3,date_applied=$4,status=$5 WHERE job_id=$6 AND user_id=$7 RETURNING *",
            [title, company, location, date_applied, status, id, req.user_id]
        )
        if (updatedJob.rows.length === 0) {
            return res.status(404).send("Job not found ")
        }
        res.json(updatedJob.rows[0])

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}

//delete job by job id
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params
        const deletedJob = await db.query(
            "DELETE FROM jobs WHERE job_id=$1 AND user_id=$2 RETURNING *",
            [id, req.user_id]
        )
        if (deletedJob.rows.length === 0) {
            return res.status(404).send("Job not found")
        }
        res.json({ message: "Job deleted successfully" })
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server error")
    }
}

module.exports = { getJobs, addJob, updateJob, deleteJob }