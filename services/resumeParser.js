const path = require("path");

async function extractResumeText(file) {
  if (!file || !file.buffer) {
    throw new Error("Choose a resume file first.");
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  let text = "";

  if (extension === ".txt") {
    text = file.buffer.toString("utf8");
  } else if (extension === ".docx") {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    text = result.value || "";
  } else if (extension === ".pdf") {
    const pdfParse = require("pdf-parse");
    const result = await pdfParse(file.buffer);
    text = result.text || "";
  } else {
    throw new Error("Unsupported file type. Upload a PDF, DOCX, or TXT file.");
  }

  text = text.replace(/\u0000/g, " ").trim();
  if (!text) {
    throw new Error("No readable text was found. Try a text-based PDF/DOCX or paste the resume manually. Scanned PDFs need OCR, which this version does not include.");
  }
  if (text.length > 30000) text = text.slice(0, 30000);
  return text;
}

module.exports = { extractResumeText };
