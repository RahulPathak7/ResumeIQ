const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    resumeText: { type: String, required: true, maxlength: 30000 },
    jobDescription: { type: String, required: true, maxlength: 20000 },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    aiGenerated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
