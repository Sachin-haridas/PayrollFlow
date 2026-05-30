// ==========================
// controllers/salaryController.js
// ==========================
const path                = require("path");
const fs                  = require("fs");
const xlsx                = require("xlsx");
const Salary              = require("../models/Salary");
const Employee            = require("../models/Employee");
const { generateSalarySlip }  = require("../utils/pdfGenerator");
const { sendSalarySlipEmail } = require("../utils/emailSender");

function parseMonthYear(value) {
  const str = String(value).trim();

  // Already a full string like "May 2026"
  if (isNaN(str) && str.includes(" ")) return str;

  // Short format like "Aug-26" or "Aug-2026"
  const months = {
    jan: "January", feb: "February", mar: "March", apr: "April",
    may: "May", jun: "June", jul: "July", aug: "August", sep: "September",
    oct: "October", nov: "November", dec: "December"
  };
  const parts = str.toLowerCase().split("-");
  if (parts.length === 2) {
    const month = months[parts[0].slice(0, 3)];
    const year = parts[1].length === 2 ? `20${parts[1]}` : parts[1];
    if (month) return `${month} ${year}`;
  }

  // Excel serial number — convert it
  if (!isNaN(str)) {
    const excelEpoch = new Date(1900, 0, 0);  // Dec 31, 1899 (Excel epoch)
    const date = new Date(excelEpoch.getTime() + Number(str) * 86400000);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  return str;
}

// ── GET all salary records ──────────────────────────────────────
const getSalaryRecords = async (req, res) => {
  try {
    const records = await Salary.find().sort({ updatedAt: -1 });

    // Months ordered by most recently uploaded CSV (not calendar/alphabetical)
    const monthGroups = await Salary.aggregate([
      { $group: { _id: "$month_year", lastUpload: { $max: "$updatedAt" } } },
      { $sort: { lastUpload: -1 } },
    ]);
    const months = monthGroups.map((g) => g._id);

    res.status(200).json({ success: true, count: records.length, records, months });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPLOAD monthly salary CSV ───────────────────────────────────
const uploadSalaryCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook  = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rows      = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    fs.unlinkSync(req.file.path);

    if (!rows.length) {
      return res.status(400).json({ success: false, message: "File is empty" });
    }

    // Validate required columns (now including month_year)
    const required = ["emp_id", "base_salary", "hra", "allowances", "deductions", "month_year"];
    const headers  = Object.keys(rows[0]).map((k) => k.toLowerCase().trim());
    const missing  = required.filter((r) => !headers.includes(r));
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing columns: ${missing.join(", ")}`,
      });
    }

    // Normalise and compute net salary
    const salaries = rows.map((row) => {
      const n = {};
      Object.keys(row).forEach((k) => (n[k.toLowerCase().trim()] = row[k]));
      const base_salary = Number(n.base_salary);
      const hra         = Number(n.hra);
      const allowances  = Number(n.allowances);
      const deductions  = Number(n.deductions);
      return {
        emp_id:      String(n.emp_id).trim().toUpperCase(),
        base_salary,
        hra,
        allowances,
        deductions,
        net_salary:  base_salary + hra + allowances - deductions,
        month_year:  parseMonthYear(n.month_year),  // Parse from CSV per row
      };
    });

    // Validate all rows have month_year after parsing
    const missingMonth = salaries.find((s) => !s.month_year);
    if (missingMonth) {
      return res.status(400).json({
        success: false,
        message: "Some rows have invalid or missing month_year. Check your CSV.",
      });
    }

    // Validate all emp_ids exist in DB
    const uploadedIds  = salaries.map((s) => s.emp_id);
    const foundEmployees = await Employee.find({ emp_id: { $in: uploadedIds } });
    const foundIds     = foundEmployees.map((e) => e.emp_id);
    const notFound     = uploadedIds.filter((id) => !foundIds.includes(id));

    if (notFound.length) {
      return res.status(400).json({
        success: false,
        message: `These Employee IDs were not found in master: ${notFound.join(", ")}`,
      });
    }

    // Upsert — update if same emp+month exists, insert if new
    const ops = salaries.map((sal) => ({
      updateOne: {
        filter: { emp_id: sal.emp_id, month_year: sal.month_year },
        update: {
          $set: sal,
          $currentDate: { updatedAt: true },
        },
        upsert: true,
      },
    }));
    const result = await Salary.bulkWrite(ops);

    // Get unique months from uploaded data
    const uploadedMonths = [...new Set(salaries.map((s) => s.month_year))].sort();

    res.status(200).json({
      success:        true,
      message:        "Salary data uploaded successfully",
      inserted:       result.upsertedCount,
      updated:        result.modifiedCount,
      total:          salaries.length,
      uploaded_months: uploadedMonths,
      preview:        salaries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── SEND SLIPS — generate PDF + email for given month ──────────
const sendSalarySlips = async (req, res) => {
  const { month_year } = req.body;

  if (!month_year) {
    return res.status(400).json({ success: false, message: "month_year is required" });
  }

  try {
    // Fetch all salary records for this month
    const salaries = await Salary.find({ month_year });
    if (!salaries.length) {
      return res.status(404).json({
        success: false,
        message: `No salary records found for ${month_year}`,
      });
    }

    // Fetch all related employees in one query
    const empIds    = salaries.map((s) => s.emp_id);
    const employees = await Employee.find({ emp_id: { $in: empIds } });
    const empMap    = {};
    employees.forEach((e) => (empMap[e.emp_id] = e));

    // Make sure slips folder exists
    const slipsDir = path.join(__dirname, "../slips");
    if (!fs.existsSync(slipsDir)) fs.mkdirSync(slipsDir);

    // Process each employee
    const statusReport = [];
    for (const salary of salaries) {
      const employee = empMap[salary.emp_id];
      if (!employee) {
        statusReport.push({ emp_id: salary.emp_id, status: "failed", reason: "Employee not found" });
        continue;
      }

      try {
        // 1. Generate PDF
        const pdfPath = path.join(
          slipsDir,
          `slip_${employee.emp_id}_${month_year.replace(" ", "_")}.pdf`
        );
        await generateSalarySlip({ employee, salary }, pdfPath);

        // 2. Send Email
        await sendSalarySlipEmail(employee, salary, pdfPath);

        statusReport.push({ emp_id: employee.emp_id, name: employee.name, email: employee.email, status: "sent" });
      } catch (err) {
        statusReport.push({ emp_id: employee.emp_id, name: employee.name, status: "failed", reason: err.message });
      }
    }

    const sent   = statusReport.filter((r) => r.status === "sent").length;
    const failed = statusReport.filter((r) => r.status === "failed").length;

    res.status(200).json({
      success: true,
      summary: { total: salaries.length, sent, failed },
      report:  statusReport,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSalaryRecords, uploadSalaryCSV, sendSalarySlips };

// ==========================
// controllers/salaryController.js
// ==========================
// const path                = require("path");
// const fs                  = require("fs");
// const xlsx                = require("xlsx");
// const Salary              = require("../models/Salary");
// const Employee            = require("../models/Employee");
// const { generateSalarySlip }  = require("../utils/pdfGenerator");
// const { sendSalarySlipEmail } = require("../utils/emailSender");

// // ── GET all salary records ──────────────────────────────────────
// const getSalaryRecords = async (req, res) => {
//   try {
//     const records = await Salary.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, count: records.length, records });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // function parseMonthYear(value) {
// //     const str = String(value).trim()
  
// //     // If it's already a readable string like "May 2026", return as-is
// //     if (isNaN(str)) return str
  
// //     // It's an Excel serial number — convert it
// //     const excelEpoch = new Date(1899, 11, 30) // Excel starts from Dec 30, 1899
// //     const date = new Date(excelEpoch.getTime() + Number(str) * 86400000)
  
// //     return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
// //     // → "May 2026"
// //   }

// function parseMonthYear(value) {
//   const str = String(value).trim()

//   // Already a full string like "May 2026"
//   if (isNaN(str) && str.includes(' ')) return str

//   // Excel serial number like 46235
//   // if (!isNaN(str)) {
//   //   const excelEpoch = new Date(1899, 11, 30)
//   //   const date = new Date(excelEpoch.getTime() + Number(str) * 86400000)
//   //   return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
//   // }

//   // Short format like "Aug-26" or "Aug-2026"
//   const months = { jan:'January', feb:'February', mar:'March', apr:'April',
//     may:'May', jun:'June', jul:'July', aug:'August', sep:'September',
//     oct:'October', nov:'November', dec:'December' }
//   const parts = str.toLowerCase().split('-')
//   if (parts.length === 2) {
//     const month = months[parts[0].slice(0, 3)]
//     const year  = parts[1].length === 2 ? `20${parts[1]}` : parts[1]
//     if (month) return `${month} ${year}` // → "August 2026"
//   }

//   return str // fallback
// }

// // ── GET distinct months (for send slip dashboard dropdown) ──────
// const getAvailableMonths = async (req, res) => {
//   try {
//     const months = await Salary.distinct("month_year");
//     res.status(200).json({ success: true, months });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ── UPLOAD monthly salary CSV ───────────────────────────────────
// const uploadSalaryCSV = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     const workbook  = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });
//     fs.unlinkSync(req.file.path);

//     if (!rows.length) {
//       return res.status(400).json({ success: false, message: "File is empty" });
//     }

//     // Validate required columns — month_year must be in CSV
//     const required = ["emp_id", "base_salary", "hra", "allowances", "deductions", "month_year"];
//     const headers  = Object.keys(rows[0]).map((k) => k.toLowerCase().trim());
//     const missing  = required.filter((r) => !headers.includes(r));
//     if (missing.length) {
//       return res.status(400).json({
//         success: false,
//         message: `Missing columns: ${missing.join(", ")}`,
//       });
//     }

//     // Normalise keys and compute net salary
//     // month_year is read directly from each CSV row
//     const salaries = rows.map((row) => {
//       const n = {};
//       Object.keys(row).forEach((k) => (n[k.toLowerCase().trim()] = row[k]));
//       const base_salary = Number(n.base_salary);
//       const hra         = Number(n.hra);
//       const allowances  = Number(n.allowances);
//       const deductions  = Number(n.deductions);
//       return {
//         emp_id:      String(n.emp_id).trim().toUpperCase(),
//         base_salary,
//         hra,
//         allowances,
//         deductions,
//         net_salary:  base_salary + hra + allowances - deductions,
//         month_year: parseMonthYear(n.month_year), // converts THEN saves// ← straight from CSV
//       };
//     });

//     // Make sure all rows have a valid month_year value
//     const missingMonth = salaries.find((s) => !s.month_year);
//     if (missingMonth) {
//       return res.status(400).json({
//         success: false,
//         message: `Some rows are missing a month_year value. Please check your CSV.`,
//       });
//     }

//     // Validate all emp_ids exist in DB
//     const uploadedIds    = salaries.map((s) => s.emp_id);
//     const foundEmployees = await Employee.find({ emp_id: { $in: uploadedIds } });
//     const foundIds       = foundEmployees.map((e) => e.emp_id);
//     const notFound       = uploadedIds.filter((id) => !foundIds.includes(id));

//     if (notFound.length) {
//       return res.status(400).json({
//         success: false,
//         message: `These Employee IDs were not found in master: ${notFound.join(", ")}`,
//       });
//     }

//     // Upsert — update if same emp+month exists, insert if new
//     const ops = salaries.map((sal) => ({
//       updateOne: {
//         filter: { emp_id: sal.emp_id, month_year: sal.month_year },
//         update: { $set: sal },
//         upsert: true,
//       },
//     }));
//     const result = await Salary.bulkWrite(ops);

//     // Return unique months found in this upload so frontend can show them
//     const uploadedMonths = [...new Set(salaries.map((s) => s.month_year))];

//     res.status(200).json({
//       success:        true,
//       message:        "Salary data uploaded successfully",
//       inserted:       result.upsertedCount,
//       updated:        result.modifiedCount,
//       total:          salaries.length,
//       uploaded_months: uploadedMonths,
//       preview:        salaries,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ── SEND SLIPS — generate PDF + email for given month ──────────
// const sendSalarySlips = async (req, res) => {
//   const { month_year } = req.body;

//   if (!month_year) {
//     return res.status(400).json({ success: false, message: "month_year is required" });
//   }

//   try {
//     const salaries = await Salary.find({ month_year });
//     if (!salaries.length) {
//       return res.status(404).json({
//         success: false,
//         message: `No salary records found for ${month_year}`,
//       });
//     }

//     const empIds     = salaries.map((s) => s.emp_id);
//     const employees  = await Employee.find({ emp_id: { $in: empIds } });
//     const empMap     = {};
//     employees.forEach((e) => (empMap[e.emp_id] = e));

//     const slipsDir = path.join(__dirname, "../slips");
//     if (!fs.existsSync(slipsDir)) fs.mkdirSync(slipsDir);

//     const statusReport = [];
//     for (const salary of salaries) {
//       const employee = empMap[salary.emp_id];
//       if (!employee) {
//         statusReport.push({ emp_id: salary.emp_id, status: "failed", reason: "Employee not found" });
//         continue;
//       }
//       try {
//         const pdfPath = path.join(
//           slipsDir,
//           `slip_${employee.emp_id}_${month_year.replace(/\s/g, "_")}.pdf`
//         );
//         await generateSalarySlip({ employee, salary }, pdfPath);
//         await sendSalarySlipEmail(employee, salary, pdfPath);
//         statusReport.push({ emp_id: employee.emp_id, name: employee.name, email: employee.email, status: "sent" });
//       } catch (err) {
//         statusReport.push({ emp_id: employee.emp_id, name: employee.name, status: "failed", reason: err.message });
//       }
//     }

//     const sent   = statusReport.filter((r) => r.status === "sent").length;
//     const failed = statusReport.filter((r) => r.status === "failed").length;

//     res.status(200).json({
//       success: true,
//       summary: { total: salaries.length, sent, failed },
//       report:  statusReport,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { getSalaryRecords, getAvailableMonths, uploadSalaryCSV, sendSalarySlips };