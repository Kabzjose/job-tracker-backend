const express = require("express")
const router = express.Router()
const { getJobs, addJob, updateJob, deleteJob } = require("../controllers/jobsController")
const authMiddleware = require("../middleware/authMiddleware")

router.get("/", authMiddleware, getJobs)
router.post("/", authMiddleware, addJob)
router.put("/:id", authMiddleware, updateJob)
router.delete("/:id", authMiddleware, deleteJob)

module.exports = router
