
const resumeInput = document.getElementById("resumeText");
const jobInput = document.getElementById("jobDescription");
const analyzeBtn = document.getElementById("analyzeBtn");
const statusText = document.getElementById("status");
const results = document.getElementById("results");
const resumeFileInput = document.getElementById("resumeFile");

let latestAnalysis = null;

// Update the character counter below an input.
function updateCounter(input, counterId, maxLength) {
  document.getElementById(counterId).textContent =
    `${input.value.length} / ${maxLength}`;
}

// Update counters whenever the user types.
resumeInput.addEventListener("input", () =>
  updateCounter(resumeInput, "resumeCounter", 30000)
);

jobInput.addEventListener("input", () =>
  updateCounter(jobInput, "jobCounter", 20000)
);

// Display matched or missing keywords as chips.
function showChips(containerId, keywords, isMissing = false) {
  const container = document.getElementById(containerId);
  container.replaceChildren();

  if (!keywords || keywords.length === 0) {
    const chip = document.createElement("span");
    chip.className = "chip neutral";
    chip.textContent = "None identified";
    container.appendChild(chip);
    return;
  }

  keywords.forEach((keyword) => {
    const chip = document.createElement("span");
    chip.className = isMissing ? "chip missing" : "chip";
    chip.textContent = keyword;
    container.appendChild(chip);
  });
}

// Display the analysis returned by the backend.
function displayResults(data) {
  latestAnalysis = data;

  document.getElementById("score").textContent =
    `${data.matchScore}%`;

  document.getElementById("scoreCircle").style.background =
    `conic-gradient(#6654e8 ${data.matchScore * 3.6}deg, #e9e8f4 0deg)`;

  document.getElementById("scoreTitle").textContent =
    data.matchScore >= 70
      ? "Strong keyword coverage"
      : data.matchScore >= 40
        ? "Room for improvement"
        : "Review your resume against the role";

  const total =
    data.matchedKeywords.length + data.missingKeywords.length;

  document.getElementById("scoreDescription").textContent =
    `${data.matchedKeywords.length} matched keywords out of ${total} identified job-description skills.`;

  document.getElementById("aiBadge").textContent =
    data.aiGenerated ? "AI-powered feedback" : "Keyword analysis";

  showChips("matchedKeywords", data.matchedKeywords);
  showChips("missingKeywords", data.missingKeywords, true);

  const list = document.getElementById("suggestions");
  list.replaceChildren();

  data.suggestions.forEach((suggestion) => {
    const item = document.createElement("li");
    item.textContent = suggestion;
    list.appendChild(item);
  });

  results.hidden = false;
  results.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// Send resume text and job description to the backend.
analyzeBtn.addEventListener("click", async () => {
  const resumeText = resumeInput.value.trim();
  const jobDescription = jobInput.value.trim();

  if (!resumeText || !jobDescription) {
    statusText.textContent =
      "Please enter both your resume and the job description.";
    statusText.className = "status error";
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  statusText.className = "status";
  statusText.textContent = "Analyzing your resume. Please wait.";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        resumeText,
        jobDescription
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Analysis failed.");
    }

    displayResults(data);

    statusText.textContent = data.aiGenerated
      ? "Analysis complete. AI suggestions are included."
      : "Analysis complete. Rule-based suggestions are shown.";
  } catch (error) {
    statusText.textContent =
      error.message || "Unable to contact the server.";
    statusText.className = "status error";
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze my resume →";
  }
});

// Fill the inputs with example data for a quick demonstration.
document.getElementById("demoBtn").addEventListener("click", () => {
  resumeInput.value = `ECE student with skills in C++, JavaScript, HTML, CSS,
Node.js, Express.js, MongoDB, MySQL, REST APIs, and data structures.
Built a student accommodation platform using Node.js and Express.js.
Practiced problem solving and algorithms.`;

  jobInput.value = `We are seeking a software developer with JavaScript, HTML, CSS,
React, Node.js, Express.js, SQL, MongoDB, REST APIs, Git, data structures,
algorithms, testing, and communication skills. Experience with cloud platforms
and Docker is a plus.`;

  resumeInput.dispatchEvent(new Event("input"));
  jobInput.dispatchEvent(new Event("input"));

  statusText.textContent =
    "Sample data loaded. Click Analyze my resume.";
  statusText.className = "status";
});

// Extract text from a selected PDF, DOCX, or TXT file.
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const file = resumeFileInput.files[0];
  const fileStatus = document.getElementById("fileStatus");
  const button = document.getElementById("uploadBtn");

  if (!file) {
    fileStatus.textContent = "Choose a resume file first.";
    fileStatus.className = "file-status error";
    return;
  }

  const formData = new FormData();
  formData.append("resumeFile", file);

  button.disabled = true;
  button.textContent = "Reading...";
  fileStatus.textContent = "Extracting resume text...";
  fileStatus.className = "file-status";

  try {
    const response = await fetch("/api/analyze/parse-resume", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not read this file.");
    }

    resumeInput.value = data.resumeText;
    resumeInput.dispatchEvent(new Event("input"));

    fileStatus.textContent =
      `Loaded ${data.fileName}. Review the extracted text, then analyze.`;
    fileStatus.className = "file-status success";
  } catch (error) {
    fileStatus.textContent =
      error.message || "Unable to read the file.";
    fileStatus.className = "file-status error";
  } finally {
    button.disabled = false;
    button.textContent = "Read file";
  }
});

// Download the latest analysis as a plain-text report.
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!latestAnalysis) return;

  const data = latestAnalysis;

  const report = [
    "RESUMEIQ — RESUME ANALYSIS REPORT",
    `Generated: ${new Date().toLocaleString()}`,
    `Keyword coverage score: ${data.matchScore}%`,
    `Analysis mode: ${data.aiGenerated ? "AI-powered suggestions" : "Rule-based suggestions"}`,
    "",
    "MATCHED KEYWORDS",
    ...(data.matchedKeywords.length
      ? data.matchedKeywords.map((word) => `- ${word}`)
      : ["- None identified"]),
    "",
    "MISSING KEYWORDS",
    ...(data.missingKeywords.length
      ? data.missingKeywords.map((word) => `- ${word}`)
      : ["- None identified"]),
    "",
    "IMPROVEMENT TIPS",
    ...data.suggestions.map((tip, index) => `${index + 1}. ${tip}`),
    "",
    "Note: This is a keyword coverage estimate, not a hiring prediction. Include skills only when you genuinely have them."
  ].join("\n");

  const blob = new Blob([report], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "resume-analysis-report.txt";
  link.click();

  URL.revokeObjectURL(url);
});

// Print the current report or save it as a PDF.
document.getElementById("printBtn").addEventListener("click", () => {
  if (!latestAnalysis) {
    statusText.textContent =
      "Analyze a resume before printing the report.";
    statusText.className = "status error";
    return;
  }

  window.print();
});

// Clear the input fields and the displayed report.
document.getElementById("clearBtn").addEventListener("click", () => {
  resumeInput.value = "";
  jobInput.value = "";
  resumeFileInput.value = "";

  document.getElementById("fileStatus").textContent = "";

  statusText.textContent = "";
  statusText.className = "status";

  results.hidden = true;
  latestAnalysis = null;

  updateCounter(resumeInput, "resumeCounter", 30000);
  updateCounter(jobInput, "jobCounter", 20000);
});
