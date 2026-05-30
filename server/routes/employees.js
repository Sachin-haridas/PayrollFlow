// ==========================
// routes/employees.js
// ==========================
const express  = require("express");
const router   = express.Router();
const upload   = require("../middleware/upload");
const {
  getEmployees,
  addEmployee,
  uploadEmployeeCSV,
} = require("../controllers/employeeController");

// GET  /api/employees          → get all employees
// POST /api/employees/add      → add single employee (manual)
// POST /api/employees/upload   → upload employee master CSV

router.get("/",        getEmployees);
router.post("/add",    addEmployee);
router.post("/upload", upload.single("file"), uploadEmployeeCSV);

module.exports = router;