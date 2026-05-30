// ==========================
// controllers/employeeController.js
// ==========================
const Employee = require("../models/Employee");
const xlsx     = require("xlsx");
const fs       = require("fs");

// ── GET all employees ───────────────────────────────────────────
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ emp_id: 1 });
    res.status(200).json({ success: true, count: employees.length, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADD single employee ─────────────────────────────────────────
const addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, employee });
  } catch (error) {
    // Duplicate key
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Employee ID ${req.body.emp_id} already exists`,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPLOAD employee master CSV / Excel ──────────────────────────
const uploadEmployeeCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Parse the file
    const workbook  = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rows      = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Clean up uploaded file after parsing
    fs.unlinkSync(req.file.path);

    if (!rows.length) {
      return res.status(400).json({ success: false, message: "File is empty" });
    }

    // Validate required columns
    const required = ["emp_id", "name", "email", "designation"];
    const headers  = Object.keys(rows[0]).map((k) => k.toLowerCase().trim());
    const missing  = required.filter((r) => !headers.includes(r));
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing columns: ${missing.join(", ")}`,
      });
    }

    // Normalise keys to lowercase
    const employees = rows.map((row) => {
      const normalised = {};
      Object.keys(row).forEach((k) => (normalised[k.toLowerCase().trim()] = row[k]));
      return {
        emp_id:      String(normalised.emp_id).trim().toUpperCase(),
        name:        String(normalised.name).trim(),
        email:       String(normalised.email).trim().toLowerCase(),
        designation: String(normalised.designation).trim(),
      };
    });

    // Bulk upsert — update if exists, insert if new
    const ops = employees.map((emp) => ({
      updateOne: {
        filter: { emp_id: emp.emp_id },
        update: { $set: emp },
        upsert: true,
      },
    }));

    const result = await Employee.bulkWrite(ops);

    res.status(200).json({
      success: true,
      message: "Employee master uploaded successfully",
      inserted: result.upsertedCount,
      updated:  result.modifiedCount,
      total:    employees.length,
      preview:  employees, // send back for frontend preview table
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEmployees, addEmployee, uploadEmployeeCSV };