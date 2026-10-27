const multer = require("multer");

const allowedExtensions = new Set([".pdf", ".docx", ".txt"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    const path = require("path");
    const extension = path.extname(file.originalname || "").toLowerCase();
    if (!allowedExtensions.has(extension)) {
      return callback(new Error("Unsupported file type. Upload a PDF, DOCX, or TXT file."));
    }
    callback(null, true);
  }
});

module.exports = upload;
