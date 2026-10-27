
const mongoose = require("mongoose");
const Analysis = require("../models/Analysis");

const {
  calculateAnalysis,
  generateAISuggestions
} = require("../services/analysisService");

const { extractResumeText } = require("../services/resumeParser");

// Analyze pasted resume text against a job description.
async function analyzeResume(req, res) {
  try {
    const { resumeText, jobDescription } = req.body || {};

    if (
      typeof resumeText !== "string" ||
      typeof jobDescription !== "string" ||
      !resumeText.trim() ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        message: "Please provide both your resume and job description."
      });
    }

    if (
      resumeText.length > 30000 ||
      jobDescription.length > 20000
    ) {
      return res.status(400).json({
        message:
          "Resume must be 30,000 characters or less and job description 20,000 characters or less."
      });
    }

    // Calculate the keyword match score and rule-based suggestions.
    const result = calculateAnalysis(resumeText, jobDescription);

    // Use AI suggestions when configured and available.
    // If AI fails, retain the rule-based suggestions.
    try {
      const aiSuggestions = await generateAISuggestions(
        resumeText,
        jobDescription
      );

      if (aiSuggestions) {
        result.suggestions = aiSuggestions;
        result.aiGenerated = true;
      }
    } catch (aiError) {
      console.error(
        "AI suggestions unavailable:",
        aiError.message
      );
    }

    // Save the analysis to MongoDB when a connection is available.
    if (mongoose.connection.readyState === 1) {
      try {
        const saved = await Analysis.create({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim(),
          ...result
        });

        result.analysisId = saved._id.toString();
      } catch (dbError) {
        // Analysis can still be returned if saving fails.
        console.error(
          "Could not save analysis:",
          dbError.message
        );
      }
    }

    return res.json(result);
  } catch (error) {
    console.error("Analysis error:", error.message);

    return res.status(500).json({
      message: "Something went wrong while analyzing your resume."
    });
  }
}

// Extract text from an uploaded PDF, DOCX, or TXT resume.
async function parseResumeUpload(req, res) {
  try {
    const resumeText = await extractResumeText(req.file);

    return res.json({
      resumeText,
      fileName: req.file.originalname
    });
  } catch (error) {
    return res.status(400).json({
      message:
        error.message || "Could not read the uploaded resume."
    });
  }
}

// Analyze an uploaded resume directly against the job description.
async function analyzeUploadedResume(req, res) {
  try {
    const { jobDescription } = req.body || {};

    if (
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a job description."
      });
    }

    if (jobDescription.length > 20000) {
      return res.status(400).json({
        message:
          "Job description must be 20,000 characters or less."
      });
    }

    const resumeText = await extractResumeText(req.file);

    // Reuse the existing analysis pipeline.
    req.body = {
      resumeText,
      jobDescription
    };

    return analyzeResume(req, res);
  } catch (error) {
    return res.status(400).json({
      message:
        error.message || "Could not read the uploaded resume."
    });
  }
}

module.exports = {
  analyzeResume,
  analyzeUploadedResume,
  parseResumeUpload
};
