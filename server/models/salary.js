// ==========================
// models/Salary.js
// ==========================
const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    emp_id: {
      type: String,
      required: true,
      ref: "Employee",
      uppercase: true,
      trim: true,
    },
    base_salary:  { type: Number, required: true, min: 0 },
    hra:          { type: Number, required: true, min: 0 },
    allowances:   { type: Number, required: true, min: 0 },
    deductions:   { type: Number, required: true, min: 0 },
    net_salary:   { type: Number },
    month_year:   { type: String, required: true, trim: true }, // e.g. "May 2026"
  },
  { timestamps: true }
);

// Auto-calculate net_salary before saving
salarySchema.pre("save", function (next) {
  this.net_salary =
    this.base_salary + this.hra + this.allowances - this.deductions;
  next();
});

// Prevent duplicate salary entry for same emp + month
salarySchema.index({ emp_id: 1, month_year: 1 }, { unique: true });

module.exports = mongoose.model("Salary", salarySchema);