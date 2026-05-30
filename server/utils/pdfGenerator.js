// ==========================
// utils/pdfGenerator.js
// Generates a salary slip PDF
// using pdfkit
// ==========================
const PDFDocument = require("pdfkit");
const fs          = require("fs");
const path        = require("path");

/**
 * Generates a salary slip PDF for one employee
 * @param {Object} data  - { employee, salary }
 * @param {String} destPath - full file path to save PDF
 */
const generateSalarySlip = (data, destPath) => {
  return new Promise((resolve, reject) => {
    const { employee, salary } = data;

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(destPath);
    doc.pipe(stream);

    const BLUE  = "#1A73E8";
    const DARK  = "#1C1C1E";
    const GREY  = "#F5F5F5";
    const W     = 500;

    // ── Header ────────────────────────────────────────
    doc.rect(50, 50, W, 70).fill(DARK);
    doc
      .fillColor("white")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("SALARY SLIP", 50, 68, { width: W, align: "center" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Month: ${salary.month_year}`, 50, 92, { width: W, align: "center" });

    doc.fillColor(DARK);

    // ── Employee Info ──────────────────────────────────
    doc.moveDown(3);
    doc.fontSize(12).font("Helvetica-Bold").fillColor(BLUE).text("Employee Details");
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(BLUE).lineWidth(1).stroke();
    doc.moveDown(0.5);

    const infoY = doc.y;
    doc.fontSize(10).font("Helvetica").fillColor(DARK);

    const leftCol  = [
      ["Employee ID",  employee.emp_id],
      ["Name",         employee.name],
      ["Designation",  employee.designation],
      ["Email",        employee.email],
    ];

    leftCol.forEach(([label, value]) => {
      doc
        .font("Helvetica-Bold").text(`${label}:`, 50, doc.y, { continued: true, width: 130 })
        .font("Helvetica").text(` ${value}`);
      doc.moveDown(0.4);
    });

    // ── Earnings & Deductions Table ────────────────────
    doc.moveDown(1);
    doc.fontSize(12).font("Helvetica-Bold").fillColor(BLUE).text("Salary Breakdown");
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(BLUE).lineWidth(1).stroke();
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    doc.rect(50, tableTop, W, 24).fill(BLUE);
    doc.fillColor("white").fontSize(10).font("Helvetica-Bold");
    doc.text("Component",    60,  tableTop + 7);
    doc.text("Amount (₹)",   400, tableTop + 7, { width: 140, align: "right" });

    // Table rows
    const rows = [
      ["Basic Salary",  salary.base_salary,  false],
      ["HRA",           salary.hra,           false],
      ["Allowances",    salary.allowances,    false],
      ["Deductions",    salary.deductions,    true ],
    ];

    let rowY = tableTop + 24;
    rows.forEach(([label, amount, isDeduction], i) => {
      const bg = i % 2 === 0 ? "#F0F4FF" : "white";
      doc.rect(50, rowY, W, 24).fill(bg);
      doc
        .fillColor(isDeduction ? "#EA4335" : DARK)
        .font("Helvetica")
        .fontSize(10)
        .text(label, 60, rowY + 7)
        .text(
          `${isDeduction ? "- " : "+ "}₹ ${Number(amount).toLocaleString("en-IN")}`,
          400, rowY + 7, { width: 140, align: "right" }
        );
      rowY += 24;
    });

    // Net Salary row
    doc.rect(50, rowY, W, 28).fill(DARK);
    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Net Salary", 60, rowY + 8)
      .text(
        `₹ ${Number(salary.net_salary).toLocaleString("en-IN")}`,
        400, rowY + 8, { width: 140, align: "right" }
      );

    // ── Footer ────────────────────────────────────────
    doc.moveDown(5);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#888")
      .text(
        "This is a system-generated salary slip and does not require a signature.",
        50, doc.y, { width: W, align: "center" }
      );

    doc.end();
    stream.on("finish", () => resolve(destPath));
    stream.on("error",  reject);
  });
};

module.exports = { generateSalarySlip };

// ==========================
// utils/pdfGenerator.js
// Generates a salary slip PDF using pdfkit
// ==========================
// const PDFDocument = require("pdfkit");
// const fs          = require("fs");
// const path        = require("path");

// /**
//  * Formats a date string to "15 Mar 2022" style
//  */
// const formatDate = (dateStr) => {
//   if (!dateStr) return "—";
//   const d = new Date(dateStr);
//   if (isNaN(d)) return String(dateStr);
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// };

// /**
//  * Generates a salary slip PDF for one employee
//  * @param {Object} data     - { employee, salary }
//  * @param {String} destPath - full file path to save PDF
//  */
// const generateSalarySlip = (data, destPath) => {
//   return new Promise((resolve, reject) => {
//     const { employee, salary } = data;

//     const doc    = new PDFDocument({ size: "A4", margin: 0 });
//     const stream = fs.createWriteStream(destPath);
//     doc.pipe(stream);

//     // ── Colours ─────────────────────────────────────────
//     const INDIGO    = "#4F46E5";
//     const INDIGO_LT = "#EEF2FF";
//     const DARK      = "#1C1917";
//     const MID       = "#57534E";
//     const LIGHT     = "#F5F3EF";
//     const WHITE     = "#FFFFFF";
//     const GREEN     = "#059669";
//     const RED       = "#E11D48";
//     const TEAL      = "#0D9488";
//     const PAGE_W    = 595;
//     const MARGIN    = 44;
//     const CONTENT_W = PAGE_W - MARGIN * 2;

//     // ── Header Banner ────────────────────────────────────
//     doc.rect(0, 0, PAGE_W, 90).fill(INDIGO);

//     // Company name / title
//     doc
//       .fillColor(WHITE)
//       .font("Helvetica-Bold")
//       .fontSize(20)
//       .text("SALARY SLIP", MARGIN, 22, { width: CONTENT_W, align: "center" });

//     doc
//       .font("Helvetica")
//       .fontSize(10)
//       .fillColor("rgba(255,255,255,0.75)")
//       .text(`Pay Period: ${salary.month_year}`, MARGIN, 50, { width: CONTENT_W, align: "center" });

//     // Slip ID chip
//     const slipId = `SLIP-${employee.emp_id}-${String(salary.month_year).replace(/\s/g, "").toUpperCase()}`;
//     doc
//       .fontSize(8)
//       .fillColor("rgba(255,255,255,0.55)")
//       .text(slipId, MARGIN, 68, { width: CONTENT_W, align: "center" });

//     // ── Net Salary Hero ──────────────────────────────────
//     doc.rect(0, 90, PAGE_W, 58).fill(INDIGO_LT);
//     doc
//       .font("Helvetica")
//       .fontSize(10)
//       .fillColor(INDIGO)
//       .text("NET SALARY", MARGIN, 102, { width: CONTENT_W, align: "center" });
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(26)
//       .fillColor(INDIGO)
//       .text(`₹ ${Number(salary.net_salary).toLocaleString("en-IN")}`, MARGIN, 116, { width: CONTENT_W, align: "center" });

//     // ── Section: Employee Details ────────────────────────
//     let y = 170;

//     // Section label
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(9)
//       .fillColor(INDIGO)
//       .text("EMPLOYEE DETAILS", MARGIN, y);
//     y += 14;
//     doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(INDIGO).lineWidth(0.75).stroke();
//     y += 10;

//     // Two-column employee info grid
//     const colW   = CONTENT_W / 2 - 10;
//     const fields = [
//       ["Employee ID",   employee.emp_id],
//       ["Full Name",     employee.name],
//       ["Designation",   employee.designation],
//       ["Department",    employee.department || "—"],        // ← NEW
//       ["Email",         employee.email],
//       ["Joining Date",  formatDate(employee.joining_date)], // ← NEW
//     ];

//     fields.forEach(([label, value], idx) => {
//       const col = idx % 2;
//       const x   = MARGIN + col * (colW + 20);

//       // row background on even rows
//       if (idx % 4 < 2) {
//         doc.rect(MARGIN + col * (colW + 20) - 4, y - 3, colW + 8, 20).fill(LIGHT).fillColor(DARK);
//       }

//       doc
//         .font("Helvetica")
//         .fontSize(8.5)
//         .fillColor(MID)
//         .text(label.toUpperCase(), x, y, { width: colW });

//       doc
//         .font("Helvetica-Bold")
//         .fontSize(9.5)
//         .fillColor(DARK)
//         .text(String(value), x, y + 10, { width: colW });

//       // move y after every second field
//       if (col === 1) y += 30;
//     });
//     // if odd number of fields, move y
//     if (fields.length % 2 !== 0) y += 30;

//     y += 10;

//     // ── Section: Salary Breakdown ────────────────────────
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(9)
//       .fillColor(INDIGO)
//       .text("SALARY BREAKDOWN", MARGIN, y);
//     y += 14;
//     doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(INDIGO).lineWidth(0.75).stroke();
//     y += 8;

//     // Table header
//     const COL1 = MARGIN;
//     const COL2 = MARGIN + 220;
//     const COL3 = MARGIN + 350;
//     const ROW_H = 26;

//     doc.rect(MARGIN, y, CONTENT_W, ROW_H).fill(INDIGO);
//     doc
//       .fillColor(WHITE)
//       .font("Helvetica-Bold")
//       .fontSize(9);
//     doc.text("COMPONENT",     COL1 + 8, y + 9);
//     doc.text("TYPE",          COL2,     y + 9, { width: 100, align: "center" });
//     doc.text("AMOUNT (₹)",    COL3,     y + 9, { width: 145, align: "right" });
//     y += ROW_H;

//     // Earnings rows
//     const earnings = [
//       ["Basic Salary", "Earning", salary.base_salary,  false],
//       ["HRA",          "Earning", salary.hra,           false],
//       ["Allowances",   "Earning", salary.allowances,    false],
//       ["Deductions",   "Deduction", salary.deductions,  true ],
//     ];

//     earnings.forEach(([label, type, amount, isDed], i) => {
//       const bg = i % 2 === 0 ? LIGHT : WHITE;
//       doc.rect(MARGIN, y, CONTENT_W, ROW_H).fill(bg);

//       // left border colour strip
//       doc.rect(MARGIN, y, 3, ROW_H).fill(isDed ? RED : TEAL);

//       doc
//         .font("Helvetica")
//         .fontSize(9.5)
//         .fillColor(DARK)
//         .text(label, COL1 + 10, y + 8);

//       // type badge
//       const badgeColor = isDed ? RED : GREEN;
//       doc.rect(COL2 + 10, y + 6, 60, 14).fill(isDed ? "#FFF1F2" : "#ECFDF5").fillColor(badgeColor);
//       doc
//         .font("Helvetica-Bold")
//         .fontSize(7.5)
//         .text(type.toUpperCase(), COL2 + 10, y + 9, { width: 60, align: "center" });

//       doc
//         .font("Helvetica-Bold")
//         .fontSize(9.5)
//         .fillColor(isDed ? RED : DARK)
//         .text(
//           `${isDed ? "− " : "+ "}₹ ${Number(amount).toLocaleString("en-IN")}`,
//           COL3, y + 8, { width: 145, align: "right" }
//         );

//       y += ROW_H;
//     });

//     // Gross row
//     const grossSalary = Number(salary.base_salary) + Number(salary.hra) + Number(salary.allowances);
//     doc.rect(MARGIN, y, CONTENT_W, ROW_H).fill("#F0F4FF");
//     doc.rect(MARGIN, y, 3, ROW_H).fill(INDIGO);
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(9.5)
//       .fillColor(INDIGO)
//       .text("Gross Salary", COL1 + 10, y + 8)
//       .text(`₹ ${grossSalary.toLocaleString("en-IN")}`, COL3, y + 8, { width: 145, align: "right" });
//     y += ROW_H;

//     // Net Salary row
//     doc.rect(MARGIN, y, CONTENT_W, ROW_H + 4).fill(INDIGO);
//     doc.rect(MARGIN, y, 3, ROW_H + 4).fill("#A5B4FC");
//     doc
//       .fillColor(WHITE)
//       .font("Helvetica-Bold")
//       .fontSize(11)
//       .text("NET SALARY", COL1 + 10, y + 9)
//       .text(
//         `₹ ${Number(salary.net_salary).toLocaleString("en-IN")}`,
//         COL3, y + 9, { width: 145, align: "right" }
//       );
//     y += ROW_H + 4;

//     // ── Summary Stats Row ────────────────────────────────
//     y += 18;
//     const boxes = [
//       { label: "Gross",      value: `₹${grossSalary.toLocaleString("en-IN")}`,               color: TEAL   },
//       { label: "Deductions", value: `₹${Number(salary.deductions).toLocaleString("en-IN")}`, color: RED    },
//       { label: "Net Pay",    value: `₹${Number(salary.net_salary).toLocaleString("en-IN")}`,  color: INDIGO },
//     ];
//     const boxW = CONTENT_W / 3 - 8;
//     boxes.forEach((b, i) => {
//       const bx = MARGIN + i * (boxW + 12);
//       doc.rect(bx, y, boxW, 44).fill(LIGHT).strokeColor(b.color).lineWidth(0.5).stroke();
//       doc.rect(bx, y, boxW, 4).fill(b.color);
//       doc
//         .font("Helvetica")
//         .fontSize(8)
//         .fillColor(MID)
//         .text(b.label.toUpperCase(), bx, y + 12, { width: boxW, align: "center" });
//       doc
//         .font("Helvetica-Bold")
//         .fontSize(11)
//         .fillColor(b.color)
//         .text(b.value, bx, y + 24, { width: boxW, align: "center" });
//     });

//     y += 62;

//     // ── Footer ───────────────────────────────────────────
//     doc.rect(0, y, PAGE_W, 54).fill(DARK);
//     doc
//       .font("Helvetica")
//       .fontSize(8.5)
//       .fillColor("rgba(255,255,255,0.6)")
//       .text(
//         "This is a system-generated salary slip and does not require a physical signature.",
//         MARGIN, y + 12, { width: CONTENT_W, align: "center" }
//       );
//     doc
//       .fontSize(8)
//       .fillColor("rgba(255,255,255,0.35)")
//       .text(
//         `Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}  •  Confidential`,
//         MARGIN, y + 30, { width: CONTENT_W, align: "center" }
//       );

//     doc.end();
//     stream.on("finish", () => resolve(destPath));
//     stream.on("error",  reject);
//   });
// };

// module.exports = { generateSalarySlip };