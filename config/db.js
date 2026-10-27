    const dns = require("node:dns");

dns.promises.setServers(["8.8.8.8", "1.1.1.1"]);
    
    
    
    const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log("MONGODB_URI not set. Running without database; history will not be saved.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.log("Continuing without database; analysis will still work.");
  }
}

module.exports = connectDB;
