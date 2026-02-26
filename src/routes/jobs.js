const express = require("express")
const router = express.Router()
const { getJobs, addJob, updateJob, deleteJob } = require("../controllers/jobsController")
const authMiddleware = require("../middleware/authMiddleware")
const { validate, jobSchema } = require("../middleware/validate")

// Define routes for job operations
router.get("/", authMiddleware, getJobs)
router.post("/", authMiddleware, validate(jobSchema), addJob)
router.put("/:id", authMiddleware, validate(jobSchema), updateJob)
router.delete("/:id", authMiddleware, deleteJob)

module.exports = router
