// ==========================
// routes/salary.js
// ==========================
const express = require("express");
const router  = express.Router();
const upload  = require("../middleware/upload");
const {
  getSalaryRecords,
  uploadSalaryCSV,
  sendSalarySlips,
} = require("../controllers/salaryController");

// GET  /api/salary             → get all salary records
// POST /api/salary/upload      → upload monthly salary CSV
// POST /api/salary/send-slips  → generate PDFs + send emails

router.get("/",            getSalaryRecords);
router.post("/upload",     upload.single("file"), uploadSalaryCSV);
router.post("/send-slips", sendSalarySlips);

module.exports = router;