// ==========================
// index.js — Server Entry Point
// ==========================
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

const fs = require("fs");
const path = require("path");

// Auto-create required folders if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const slipsDir   = path.join(__dirname, "slips");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(slipsDir))   fs.mkdirSync(slipsDir);

// Middleware
app.use(cors({
  origin: '*'
}))
app.use(express.json());
app.get("/ping", (req, res) => res.json({ message: "pong", cors: "enabled" }))

// Routes
app.use("/api/employees", require("./routes/employees"));
app.use("/api/salary",    require("./routes/salary"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});
app.get("/", (req, res) => {
    res.send("API Running Successfully");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));