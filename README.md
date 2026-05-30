# 📄 Employee Salary Slip Automation System

> A full-stack web application that automates the generation and delivery of monthly salary slip PDFs to employees via email. Built as part of the Nippon Toyota Internship — Task 1.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Gmail SMTP Setup](#gmail-smtp-setup)
- [Sample Data](#sample-data)
- [API Endpoints](#api-endpoints)
- [Features](#features)

---

## Overview

The system allows an **Admin** to:
1. Upload an Employee Master CSV (one-time setup)
2. Upload a Monthly Salary CSV every month
3. Preview the salary data before sending
4. Click one button to generate PDF salary slips and email them to every employee automatically

Employees **do not need to log in** — they simply receive their salary slip as a PDF attachment in their email inbox.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| PDF Generation | pdfkit |
| Email Dispatch | Nodemailer + Gmail SMTP |
| File Parsing | xlsx (SheetJS) |
| File Upload | Multer |
| Deployment (Frontend) | Vercel |
| Deployment (Backend) | Render / Railway |

---

## Project Structure

```
project/
├── client/                        # React Frontend
│   ├── pages/
│   │   ├── Login.jsx              # Admin login page
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── UploadEmployees.jsx    # Step 1 — Upload employee master
│   │   ├── UploadSalary.jsx       # Step 2 — Upload monthly salary CSV
│   │   └── SendSlips.jsx          # Step 3 — Send salary slips
│   └── components/
│       ├── PreviewTable.jsx       # Data preview before sending
│       ├── StatusTable.jsx        # Post-send status report
│       └── Navbar.jsx
│
├── server/                        # Node.js / Express Backend
│   ├── index.js                   # Entry point
│   ├── routes/
│   │   ├── employees.js
│   │   └── salary.js
│   ├── controllers/
│   │   ├── employeeController.js
│   │   └── salaryController.js
│   ├── models/
│   │   ├── Employee.js
│   │   └── Salary.js
│   ├── middleware/
│   │   └── upload.js              # Multer config
│   ├── utils/
│   │   ├── pdfGenerator.js        # PDF generation via pdfkit
│   │   └── emailSender.js         # Email dispatch via Nodemailer
│   ├── uploads/                   # Temp folder for uploaded files
│   ├── slips/                     # Temp folder for generated PDFs
│   └── .env                       # Environment variables (never commit this!)
│
└── README.md
```

---

## How It Works

### End-to-End Flow

```
STEP 1 — One Time Setup
Admin uploads Employee Master CSV
→ Saved permanently to MongoDB

────────────────────────────────────────

STEP 2 — Every Month
Admin uploads Monthly Salary CSV
→ month_year is auto-read from the CSV
→ Backend validates all Employee IDs exist
→ Net Salary calculated automatically
→ Data saved to MongoDB
→ Preview table shown to Admin

────────────────────────────────────────

STEP 3 — Send Slips
Admin selects month from dropdown (auto-populated)
→ Clicks "Send All Slips"
→ Backend generates individual PDF per employee
→ PDF emailed to each employee's registered email
→ Admin sees a success/failure report per employee
```

### Net Salary Formula

```
Net Salary = (Base Salary + HRA + Allowances) - Deductions
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier works)
- Gmail account with 2FA enabled

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/salary-slip-automation.git
cd salary-slip-automation
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create your `.env` file (see [Environment Variables](#environment-variables) below):

```bash
cp .env.example .env
# Fill in your values
```

Create the required temp folders:

```bash
mkdir uploads slips
```

Start the server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Setup the Frontend

```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Environment Variables

Create a file called `.env` inside the `server/` folder:

```env
# MongoDB connection string from MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/salarydb

# Gmail credentials for sending emails
GMAIL_USER=youremail@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx

# Server port
PORT=5000
```

> ⚠️ Never commit your `.env` file to GitHub. It is already in `.gitignore`.

---

## Gmail SMTP Setup

The app uses **Nodemailer with Gmail SMTP** to send salary slip emails. You cannot use your regular Gmail password — you must generate an **App Password**.

### Step-by-step:

1. Go to your [Google Account](https://myaccount.google.com)
2. Navigate to **Security**
3. Make sure **2-Step Verification** is turned ON
4. In the search bar at the top, search **"App Passwords"**
5. Under App name, type anything (e.g. `salary app`)
6. Click **Create**
7. Google will show a **16-character password** like `abcd efgh ijkl mnop`
8. Copy that and paste it as `GMAIL_PASS` in your `.env`

```env
GMAIL_USER=yourname@gmail.com
GMAIL_PASS=abcd efgh ijkl mnop
```

> ✅ The app will send emails **from** your Gmail address to each employee's registered email.

### Testing Emails

To test without sending to real employees, put **your own email address** in the `email` column of the Employee Master CSV for all employees. All salary slips will then be delivered to your inbox so you can verify the PDF and email template look correct.

---

## Sample Data

### Employee Master CSV (one-time upload)

Save this as `employee_master.csv`:

```
emp_id,name,email,designation
EMP001,Arun Kumar,arun.kumar@gmail.com,Software Engineer
EMP002,Priya Nair,priya.nair@gmail.com,UI Designer
EMP003,Rahul Menon,rahul.menon@gmail.com,Backend Developer
EMP004,Sneha Das,sneha.das@gmail.com,QA Engineer
EMP005,Vikram Iyer,vikram.iyer@gmail.com,Product Manager
```

> 💡 **For testing:** Replace the email values above with your own email address so all slips land in your inbox.

```
emp_id,name,email,designation
EMP001,Arun Kumar,YOUR_EMAIL@gmail.com,Software Engineer
EMP002,Priya Nair,YOUR_EMAIL@gmail.com,UI Designer
EMP003,Rahul Menon,YOUR_EMAIL@gmail.com,Backend Developer
```

---

### Monthly Salary CSV (upload every month)

Save this as `salary_august_2026.csv`:

```
emp_id,base_salary,hra,allowances,deductions,month_year
EMP001,50000,10000,5000,3000,August 2026
EMP002,45000,9000,4000,2500,August 2026
EMP003,55000,11000,6000,4000,August 2026
EMP004,40000,8000,3500,2000,August 2026
EMP005,70000,14000,8000,5000,August 2026
```

> ⚠️ **Important notes about the CSV:**
> - `emp_id` values must exactly match what was uploaded in the Employee Master
> - `month_year` must be in plain text format: `August 2026`, `May 2026` etc.
> - If you're using Excel and the `month_year` column auto-formats as a date (showing as `aug-26` or a number), the backend will handle the conversion automatically
> - Do not leave `month_year` blank — every row must have it

---

### Net Salary Calculations for Sample Data

| Employee | Base | HRA | Allowances | Deductions | **Net** |
|---|---|---|---|---|---|
| EMP001 | 50,000 | 10,000 | 5,000 | 3,000 | **62,000** |
| EMP002 | 45,000 | 9,000 | 4,000 | 2,500 | **55,500** |
| EMP003 | 55,000 | 11,000 | 6,000 | 4,000 | **68,000** |
| EMP004 | 40,000 | 8,000 | 3,500 | 2,000 | **49,500** |
| EMP005 | 70,000 | 14,000 | 8,000 | 5,000 | **87,000** |

---

## API Endpoints

### Employee Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | Get all employees |
| POST | `/api/employees/add` | Add single employee manually |
| POST | `/api/employees/upload` | Upload employee master CSV |

### Salary Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/salary` | Get all salary records |
| POST | `/api/salary/upload` | Upload monthly salary CSV |
| POST | `/api/salary/send-slips` | Generate PDFs and send emails |

---

## Features

- ✅ CSV/Excel upload for both employee master and monthly salary data
- ✅ Auto-detection and conversion of Excel date formats (`aug-26`, serial numbers)
- ✅ Net salary auto-calculated on backend
- ✅ Duplicate entry prevention (same employee + same month)
- ✅ Preview table before sending slips
- ✅ Professional PDF salary slip generated per employee
- ✅ HTML email with salary breakdown sent to each employee
- ✅ Per-employee send status report (success / failure)
- ✅ Responsive UI (mobile + desktop)

---

## Important Notes

- Make sure `server/uploads/` and `server/slips/` folders exist before running the server
- Employee Master only needs to be uploaded once — re-uploading will update existing records
- Monthly salary CSV must be uploaded before attempting to send slips
- PDFs are automatically deleted from the server after being emailed
- All amounts are in Indian Rupees (₹)

---

*Built for Nippon Toyota Internship — Task 1: Employee Salary Slip Automation System*
