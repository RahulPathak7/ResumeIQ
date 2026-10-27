# ResumeIQ — AI Resume Analyzer

A beginner-friendly full-stack MVP that compares resume content with a target job description, identifies matched and missing skills, and suggests improvements.

## Features
- Paste resume text and job descriptions with character counters and validation.
- Upload a text-based PDF, DOCX, or TXT resume (maximum 5 MB) and extract its text on the server.
- Keyword coverage score with matched and missing skills.
- Rule-based improvement suggestions; optional OpenAI-powered suggestions when configured.
- Optional MongoDB Atlas history (latest 10 analyses).
- Download the latest report as TXT or use the browser's Print → Save as PDF.
- Sample data, clear form, responsive layout, health endpoint.

## Tech stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express, MVC-style routes/controllers/services
- Database: MongoDB Atlas + Mongoose (optional)
- AI: OpenAI API (optional)
- File parsing: `pdf-parse`, `mammoth`, `multer`

## Requirements
Install a current Node.js LTS version. Internet access is needed for the first `npm install`.

## Setup (Windows PowerShell)
Open the project root in VS Code (the folder that directly contains `package.json`) and run:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

If `.env` already exists, do not overwrite it. Open http://localhost:5000.

## Enable MongoDB history (optional)
1. Create a MongoDB Atlas cluster and database user.
2. Add your current IP in Network Access.
3. Put your connection string in `.env` as `MONGODB_URI=...`.
4. Restart the server. Do not share or commit your `.env` file.

## Enable AI suggestions (optional)
1. Create an API key at https://platform.openai.com/api-keys.
2. Put it in `.env` as `OPENAI_API_KEY=...`.
3. Keep the key server-side; never put it in frontend JavaScript or commit `.env`.
4. Restart the server. API use may incur charges.

Without these optional settings, the main keyword analysis still works. History will not persist without MongoDB, and AI tips will fall back to rule-based suggestions.

## API endpoints
- `GET /api/health` — server health check
- `POST /api/analyze` — JSON body `{ "resumeText": "...", "jobDescription": "..." }`
- `POST /api/analyze/parse-resume` — multipart form field `resumeFile`; returns extracted resume text
- `POST /api/analyze/upload` — multipart form fields `resumeFile` and `jobDescription`; runs the analysis
- `GET /api/analyze/history` — latest saved analyses, when MongoDB is connected

## Test checklist
1. Open the site and click **Try sample data**.
2. Click **Analyze my resume** and check the score, matched/missing skills, and suggestions.
3. Test an empty resume or job description; a validation message should appear.
4. Upload a text-based PDF/DOCX/TXT, click **Read file**, and check the extracted text before analyzing.
5. Download the TXT report and test **Print / Save as PDF**.
6. Refresh history. It will persist only when MongoDB is configured.
7. Visit http://localhost:5000/api/health and confirm the server reports `ok`.

## Important limitations
- The score measures coverage of skills in the app's dictionary; it is not a hiring probability or a complete semantic assessment.
- Scanned/image-only PDFs are not OCR processed; use a text-based PDF or paste the text.
- This is a portfolio MVP, not a production service. Before public deployment, add authentication, rate limiting, stronger file/content validation, privacy controls, automated tests, and deployment configuration.
- Never add a skill to a resume unless you genuinely have it. Avoid uploading sensitive personal data to services you do not trust.
