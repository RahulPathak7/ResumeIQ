require("dotenv").config();

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const analyzeRoutes = require("./routes/analyzeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/analyze", analyzeRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ResumeIQ server is running." });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
