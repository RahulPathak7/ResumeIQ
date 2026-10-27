
const express = require("express");

const {
  analyzeResume,
  analyzeUploadedResume,
  parseResumeUpload
} = require("../controllers/analyzeController");

const resumeUpload = require("../middleware/resumeUpload");

const router = express.Router();

// Analyze resume text submitted by the frontend.
router.post("/", analyzeResume);

// Upload a resume file and analyze it against a job description.
router.post("/upload", (req, res, next) => {
  resumeUpload.single("resumeFile")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "Could not upload resume."
      });
    }

    next();
  });
}, analyzeUploadedResume);

// Extract resume text without running the analysis yet.
router.post("/parse-resume", (req, res, next) => {
  resumeUpload.single("resumeFile")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || "Could not upload resume."
      });
    }

    next();
  });
}, parseResumeUpload);

module.exports = router;
