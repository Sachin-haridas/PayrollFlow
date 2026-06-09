// // ==========================
// // models/Employee.js
// // ==========================
// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema(
//   {
//     emp_id: {
//       type: String,
//       required: [true, "Employee ID is required"],
//       unique: true,
//       trim: true,
//       uppercase: true,
//     },
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
//     },
//     designation: {
//       type: String,
//       required: [true, "Designation is required"],
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Employee", employeeSchema);

// ==========================
// models/Employee.js
// ==========================
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    emp_id: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    department: {           
      type: String,
      trim: true,
      default: "",
    },
    joining_date: {         
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
