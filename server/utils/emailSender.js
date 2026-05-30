// // // ==========================
// // // utils/emailSender.js
// // // Nodemailer + Gmail SMTP
// // // ==========================
// // const nodemailer = require("nodemailer");
// // const fs         = require("fs");

// // // Create transporter once, reuse it
// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.GMAIL_USER,
// //     pass: process.env.GMAIL_PASS, // Use Gmail App Password (not your real password)
// //   },
// // });

// // /**
// //  * Sends salary slip PDF to one employee
// //  * @param {Object} employee  - { name, email }
// //  * @param {Object} salary    - { month_year, net_salary, ... }
// //  * @param {String} pdfPath   - absolute path to the generated PDF
// //  */
// // const sendSalarySlipEmail = async (employee, salary, pdfPath) => {
// //   const mailOptions = {
// //     from:    `"HR Department" <${process.env.GMAIL_USER}>`,
// //     to:      employee.email,
// //     subject: `Your Salary Slip — ${salary.month_year}`,
// //     html: `
// //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
// //         <div style="background: #1C1C1E; padding: 24px; text-align: center;">
// //           <h2 style="color: white; margin: 0;">Salary Slip — ${salary.month_year}</h2>
// //         </div>

// //         <div style="padding: 28px 32px; color: #333;">
// //           <p style="font-size: 16px;">Dear <strong>${employee.name}</strong>,</p>
// //           <p>
// //             Please find attached your salary slip for <strong>${salary.month_year}</strong>.
// //           </p>

// //           <div style="background: #F0F4FF; border-radius: 6px; padding: 16px; margin: 20px 0;">
// //             <table style="width:100%; font-size:14px; border-collapse:collapse;">
// //               <tr>
// //                 <td style="padding:6px 0; color:#555;">Employee ID</td>
// //                 <td style="padding:6px 0; font-weight:bold;">${employee.emp_id}</td>
// //               </tr>
// //               <tr>
// //                 <td style="padding:6px 0; color:#555;">Designation</td>
// //                 <td style="padding:6px 0; font-weight:bold;">${employee.designation}</td>
// //               </tr>
// //               <tr>
// //                 <td style="padding:6px 0; color:#555;">Net Salary</td>
// //                 <td style="padding:6px 0; font-weight:bold; color:#1A73E8;">
// //                   ₹ ${Number(salary.net_salary).toLocaleString("en-IN")}
// //                 </td>
// //               </tr>
// //             </table>
// //           </div>

// //           <p style="font-size:13px; color:#666;">
// //             If you have any questions regarding your salary, please contact the HR department.
// //           </p>
// //           <p style="margin-top:24px;">Regards,<br/><strong>HR Department</strong></p>
// //         </div>

// //         <div style="background:#F5F5F5; padding:12px; text-align:center; font-size:11px; color:#999;">
// //           This is a system-generated email. Please do not reply.
// //         </div>
// //       </div>
// //     `,
// //     attachments: [
// //       {
// //         filename: `SalarySlip_${employee.emp_id}_${salary.month_year.replace(" ", "_")}.pdf`,
// //         path:     pdfPath,
// //       },
// //     ],
// //   };

// //   await transporter.sendMail(mailOptions);

// //   // Clean up PDF after sending
// //   fs.unlinkSync(pdfPath);
// // };

// // module.exports = { sendSalarySlipEmail };

// // ==========================
// // utils/emailSender.js
// // Nodemailer + Gmail SMTP
// // ==========================
// const nodemailer = require("nodemailer");
// const fs         = require("fs");

// // Create transporter once, reuse it
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS, // Gmail App Password — not your real password
//   },
// });

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
//  * Sends salary slip PDF to one employee
//  * @param {Object} employee  - { emp_id, name, email, designation, department, joining_date }
//  * @param {Object} salary    - { month_year, net_salary, base_salary, hra, allowances, deductions }
//  * @param {String} pdfPath   - absolute path to the generated PDF
//  */
// const sendSalarySlipEmail = async (employee, salary, pdfPath) => {

//   const grossSalary = Number(salary.base_salary) + Number(salary.hra) + Number(salary.allowances);

//   const mailOptions = {
//     from:    `"HR Department" <${process.env.GMAIL_USER}>`,
//     to:      employee.email,
//     subject: `Salary Slip for ${salary.month_year} — ${employee.name}`,
//     html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8"/>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
// </head>
// <body style="margin:0;padding:0;background:#F5F3EF;font-family:'Segoe UI',Arial,sans-serif;">

//   <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

//     <!-- Header -->
//     <div style="background:#4F46E5;padding:32px 36px;text-align:center;">
//       <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 18px;margin-bottom:12px;">
//         <span style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:2px;text-transform:uppercase;">HR Department</span>
//       </div>
//       <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
//         Salary Slip
//       </h1>
//       <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">
//         Pay Period: <strong style="color:#ffffff;">${salary.month_year}</strong>
//       </p>
//     </div>

//     <!-- Net Salary Hero -->
//     <div style="background:#EEF2FF;padding:20px 36px;text-align:center;border-bottom:1px solid #E0E7FF;">
//       <p style="color:#4F46E5;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Net Salary Credited</p>
//       <p style="color:#4F46E5;font-size:32px;font-weight:800;margin:0;letter-spacing:-1px;">
//         ₹ ${Number(salary.net_salary).toLocaleString("en-IN")}
//       </p>
//     </div>

//     <!-- Body -->
//     <div style="padding:28px 36px;">

//       <p style="font-size:15px;color:#1C1917;margin:0 0 6px;">
//         Dear <strong>${employee.name}</strong>,
//       </p>
//       <p style="font-size:14px;color:#57534E;line-height:1.7;margin:0 0 24px;">
//         Please find attached your salary slip for <strong>${salary.month_year}</strong>.
//         Your net salary of <strong style="color:#4F46E5;">₹ ${Number(salary.net_salary).toLocaleString("en-IN")}</strong>
//         has been processed for this period.
//       </p>

//       <!-- Employee Info Card -->
//       <div style="background:#F5F3EF;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
//         <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#A8A29E;margin:0 0 14px;font-weight:600;">Employee Details</p>
//         <table style="width:100%;border-collapse:collapse;">
//           <tr>
//             <td style="padding:5px 0;font-size:13px;color:#78716C;width:50%;">Employee ID</td>
//             <td style="padding:5px 0;font-size:13px;color:#1C1917;font-weight:600;">${employee.emp_id}</td>
//           </tr>
//           <tr>
//             <td style="padding:5px 0;font-size:13px;color:#78716C;">Designation</td>
//             <td style="padding:5px 0;font-size:13px;color:#1C1917;font-weight:600;">${employee.designation}</td>
//           </tr>
//           <tr>
//             <td style="padding:5px 0;font-size:13px;color:#78716C;">Department</td>
//             <td style="padding:5px 0;font-size:13px;color:#1C1917;font-weight:600;">${employee.department || "—"}</td>
//           </tr>
//           <tr>
//             <td style="padding:5px 0;font-size:13px;color:#78716C;">Joining Date</td>
//             <td style="padding:5px 0;font-size:13px;color:#1C1917;font-weight:600;">${formatDate(employee.joining_date)}</td>
//           </tr>
//         </table>
//       </div>

//       <!-- Salary Summary Card -->
//       <div style="background:#F5F3EF;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
//         <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#A8A29E;margin:0 0 14px;font-weight:600;">Salary Summary</p>
//         <table style="width:100%;border-collapse:collapse;">
//           <tr style="border-bottom:1px solid #E7E5E4;">
//             <td style="padding:7px 0;font-size:13px;color:#78716C;">Basic Salary</td>
//             <td style="padding:7px 0;font-size:13px;color:#059669;font-weight:600;text-align:right;">+ ₹ ${Number(salary.base_salary).toLocaleString("en-IN")}</td>
//           </tr>
//           <tr style="border-bottom:1px solid #E7E5E4;">
//             <td style="padding:7px 0;font-size:13px;color:#78716C;">HRA</td>
//             <td style="padding:7px 0;font-size:13px;color:#059669;font-weight:600;text-align:right;">+ ₹ ${Number(salary.hra).toLocaleString("en-IN")}</td>
//           </tr>
//           <tr style="border-bottom:1px solid #E7E5E4;">
//             <td style="padding:7px 0;font-size:13px;color:#78716C;">Allowances</td>
//             <td style="padding:7px 0;font-size:13px;color:#059669;font-weight:600;text-align:right;">+ ₹ ${Number(salary.allowances).toLocaleString("en-IN")}</td>
//           </tr>
//           <tr style="border-bottom:1px solid #E7E5E4;">
//             <td style="padding:7px 0;font-size:13px;color:#78716C;">Gross Salary</td>
//             <td style="padding:7px 0;font-size:13px;color:#1C1917;font-weight:700;text-align:right;">₹ ${grossSalary.toLocaleString("en-IN")}</td>
//           </tr>
//           <tr style="border-bottom:1px solid #E7E5E4;">
//             <td style="padding:7px 0;font-size:13px;color:#78716C;">Deductions</td>
//             <td style="padding:7px 0;font-size:13px;color:#E11D48;font-weight:600;text-align:right;">− ₹ ${Number(salary.deductions).toLocaleString("en-IN")}</td>
//           </tr>
//           <tr style="background:#EEF2FF;border-radius:6px;">
//             <td style="padding:10px 8px;font-size:14px;color:#4F46E5;font-weight:700;border-radius:6px 0 0 6px;">Net Salary</td>
//             <td style="padding:10px 8px;font-size:16px;color:#4F46E5;font-weight:800;text-align:right;border-radius:0 6px 6px 0;">₹ ${Number(salary.net_salary).toLocaleString("en-IN")}</td>
//           </tr>
//         </table>
//       </div>

//       <p style="font-size:13px;color:#78716C;line-height:1.7;margin:0 0 6px;">
//         If you have any questions or discrepancies regarding your salary, please reach out to the HR department promptly.
//       </p>
//       <p style="font-size:14px;color:#1C1917;margin:20px 0 0;">
//         Regards,<br/>
//         <strong>HR Department</strong>
//       </p>
//     </div>

//     <!-- Footer -->
//     <div style="background:#1C1917;padding:18px 36px;text-align:center;">
//       <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;line-height:1.6;">
//         This is a system-generated email. Please do not reply directly to this message.<br/>
//         © ${new Date().getFullYear()} HR Department · Confidential
//       </p>
//     </div>

//   </div>
// </body>
// </html>
//     `,
//     attachments: [
//       {
//         filename: `SalarySlip_${employee.emp_id}_${String(salary.month_year).replace(/\s/g, "_")}.pdf`,
//         path:     pdfPath,
//       },
//     ],
//   };

//   await transporter.sendMail(mailOptions);

//   // Clean up PDF file after sending
//   if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
// };

// module.exports = { sendSalarySlipEmail };

// ==========================
// utils/emailSender.js
// Nodemailer + Gmail SMTP
// ==========================
const nodemailer = require("nodemailer");
const fs         = require("fs");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // ← force IPv4
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * Sends salary slip PDF to one employee
 * @param {Object} employee  - { emp_id, name, email, designation }
 * @param {Object} salary    - { month_year, net_salary, base_salary, hra, allowances, deductions }
 * @param {String} pdfPath   - absolute path to the generated PDF
 */
const sendSalarySlipEmail = async (employee, salary, pdfPath) => {
  const grossSalary = Number(salary.base_salary) + Number(salary.hra) + Number(salary.allowances);

  const mailOptions = {
    from:    `"HR Department" <${process.env.GMAIL_USER}>`,
    to:      employee.email,
    subject: `Salary Slip for ${salary.month_year} — ${employee.name}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#F5F3EF;font-family:'Segoe UI',Arial,sans-serif;">

  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#4F46E5;padding:32px 36px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 18px;margin-bottom:12px;">
        <span style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:2px;text-transform:uppercase;">HR Department</span>
      </div>
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Salary Slip</h1>
      <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">
        Pay Period: <strong style="color:#ffffff;">${salary.month_year}</strong>
      </p>
    </div>

    <!-- Net Salary Hero -->
    <div style="background:#EEF2FF;padding:20px 36px;text-align:center;border-bottom:1px solid #E0E7FF;">
      <p style="color:#4F46E5;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Net Salary Credited</p>
      <p style="color:#4F46E5;font-size:32px;font-weight:800;margin:0;">
        ₹ ${Number(salary.net_salary).toLocaleString("en-IN")}
      </p>
    </div>

    <!-- Body -->
    <div style="padding:28px 36px;">
      <p style="font-size:15px;color:#1C1917;margin:0 0 6px;">
        Dear <strong>${employee.name}</strong>,
      </p>
      <p style="font-size:14px;color:#57534E;line-height:1.7;margin:0 0 24px;">
        Please find attached your salary slip for <strong>${salary.month_year}</strong>.
        Your net salary of <strong style="color:#4F46E5;">₹ ${Number(salary.net_salary).toLocaleString("en-IN")}</strong>
        has been processed for this period.
      </p>

      <!-- Employee Info -->
      <div style="background:#F5F3EF;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#A8A29E;margin:0 0 14px;font-weight:600;">Employee Details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#78716C;width:50%;">Employee ID</td>
            <td style="padding:5px 0;font-size:13px;color:#1C1917;font-weight:600;">${employee.emp_id}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#78716C;">Designation</td>
            <td style="padding:5px 0;font-size:13px;color:#1C1917;font-weight:600;">${employee.designation}</td>
          </tr>
        </table>
      </div>

      <!-- Salary Summary -->
      <div style="background:#F5F3EF;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#A8A29E;margin:0 0 14px;font-weight:600;">Salary Summary</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #E7E5E4;">
            <td style="padding:7px 0;font-size:13px;color:#78716C;">Basic Salary</td>
            <td style="padding:7px 0;font-size:13px;color:#059669;font-weight:600;text-align:right;">+ ₹ ${Number(salary.base_salary).toLocaleString("en-IN")}</td>
          </tr>
          <tr style="border-bottom:1px solid #E7E5E4;">
            <td style="padding:7px 0;font-size:13px;color:#78716C;">HRA</td>
            <td style="padding:7px 0;font-size:13px;color:#059669;font-weight:600;text-align:right;">+ ₹ ${Number(salary.hra).toLocaleString("en-IN")}</td>
          </tr>
          <tr style="border-bottom:1px solid #E7E5E4;">
            <td style="padding:7px 0;font-size:13px;color:#78716C;">Allowances</td>
            <td style="padding:7px 0;font-size:13px;color:#059669;font-weight:600;text-align:right;">+ ₹ ${Number(salary.allowances).toLocaleString("en-IN")}</td>
          </tr>
          <tr style="border-bottom:1px solid #E7E5E4;">
            <td style="padding:7px 0;font-size:13px;color:#78716C;">Gross Salary</td>
            <td style="padding:7px 0;font-size:13px;color:#1C1917;font-weight:700;text-align:right;">₹ ${grossSalary.toLocaleString("en-IN")}</td>
          </tr>
          <tr style="border-bottom:1px solid #E7E5E4;">
            <td style="padding:7px 0;font-size:13px;color:#78716C;">Deductions</td>
            <td style="padding:7px 0;font-size:13px;color:#E11D48;font-weight:600;text-align:right;">− ₹ ${Number(salary.deductions).toLocaleString("en-IN")}</td>
          </tr>
          <tr style="background:#EEF2FF;">
            <td style="padding:10px 8px;font-size:14px;color:#4F46E5;font-weight:700;border-radius:6px 0 0 6px;">Net Salary</td>
            <td style="padding:10px 8px;font-size:16px;color:#4F46E5;font-weight:800;text-align:right;border-radius:0 6px 6px 0;">₹ ${Number(salary.net_salary).toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px;color:#78716C;line-height:1.7;margin:0 0 6px;">
        If you have any questions regarding your salary, please reach out to the HR department.
      </p>
      <p style="font-size:14px;color:#1C1917;margin:20px 0 0;">
        Regards,<br/><strong>HR Department</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#1C1917;padding:18px 36px;text-align:center;">
      <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;line-height:1.6;">
        This is a system-generated email. Please do not reply directly.<br/>
        © ${new Date().getFullYear()} HR Department · Confidential
      </p>
    </div>

  </div>
</body>
</html>
    `,
    attachments: [
      {
        filename: `SalarySlip_${employee.emp_id}_${String(salary.month_year).replace(/\s/g, "_")}.pdf`,
        path:     pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
};

module.exports = { sendSalarySlipEmail };