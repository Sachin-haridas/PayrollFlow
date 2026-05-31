# 📄 Employee Salary Slip Automation System

> A full-stack web application that automates the generation and delivery of monthly salary slip PDFs to employees via email. Built as part of the Nippon Toyota Internship — Task 1.

---

## 🔗 Live URLs

| Service | URL |
|---|---|
| Frontend | https://payroll-flow-seven.vercel.app |
| Backend API | https://payrollflow-q1ha.onrender.com |
| Database | MongoDB Atlas (cloud hosted) |

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Email Setup — Resend](#email-setup--resend)
- [Sample Data](#sample-data)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Known Issues & Fixes](#known-issues--fixes)

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
| Database | MongoDB Atlas (cloud) |
| PDF Generation | pdfkit |
| Email Dispatch | Resend HTTP API |
| File Parsing | xlsx (SheetJS) |
| File Upload | Multer |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

## Project Structure

```
project/
├── client/                        # React Frontend
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js             # Centralized API base URL
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadEmployees.jsx  # Step 1
│   │   │   ├── UploadSalary.jsx     # Step 2
│   │   │   └── SendSlips.jsx        # Step 3
│   │   └── components/
│   ├── .env.development           # http://localhost:5000/api
│   ├── .env.production            # https://payrollflow-q1ha.onrender.com/api
│   └── vercel.json
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
│   │   ├── pdfGenerator.js        # PDF via pdfkit
│   │   └── emailSender.js         # Email via Resend
│   ├── uploads/                   # Auto-created on startup
│   ├── slips/                     # Auto-created on startup
│   └── .env
│
└── README.md
```

---

## How It Works

### End-to-End Flow

```
STEP 1 — One Time Setup
Admin uploads Employee Master CSV
→ Saved permanently to MongoDB Atlas

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
Admin selects month from dropdown (auto-populated from DB)
→ Clicks "Send All Slips"
→ Backend generates individual PDF per employee
→ PDF emailed via Resend to each employee
→ Admin sees success/failure report per employee
```

### Net Salary Formula

```
Net Salary = (Base Salary + HRA + Allowances) - Deductions
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier)
- Resend account (free tier — 3000 emails/month)

### 1. Clone the Repository

```bash
git clone https://github.com/Sachin-haridas/PayrollFlow.git
cd PayrollFlow
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
# Fill in your values
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

Create a `.env` file inside the `server/` folder:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/salarydb

# Resend API key for email delivery
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Server port
PORT=5000
```

> ⚠️ Never commit your `.env` file to GitHub. It is already in `.gitignore`.

---

## Email Setup — Resend

The app uses **Resend HTTP API** to send salary slip emails. It works on all hosting platforms including Render's free tier.

### Step-by-step:

1. Go to [resend.com](https://resend.com) → Sign up free (use GitHub)
2. Click **API Keys** on the left sidebar
3. Click **Create API Key** → give it any name → copy the key
4. Add it to your `.env` as `RESEND_API_KEY`
5. On Render → Environment Variables → add `RESEND_API_KEY`

> ✅ Free tier: 3000 emails/month, 100/day
> ✅ No domain verification needed for testing
> ✅ Can send to any email address

### Testing Emails

To test, put your own email in the `email` column of the Employee Master CSV. All salary slips will be delivered to your inbox so you can verify the PDF and email template.

---

## Sample Data

### Employee Master CSV (one-time upload)

Save as `employee_master.csv`:

```
emp_id,name,email,designation
EMP001,Arun Kumar,your_email@gmail.com,Software Engineer
EMP002,Priya Nair,your_email@gmail.com,UI Designer
EMP003,Rahul Menon,your_email@gmail.com,Backend Developer
EMP004,Sneha Das,your_email@gmail.com,QA Engineer
EMP005,Vikram Iyer,your_email@gmail.com,Product Manager
```

> 💡 Replace `your_email@gmail.com` with any real email to receive test slips.

---

### Monthly Salary CSV (upload every month)

Save as `salary_february_2027.csv`:

```
emp_id,base_salary,hra,allowances,deductions,month_year
EMP001,50000,10000,5000,3000,February 2027
EMP002,45000,9000,4000,2500,February 2027
EMP003,55000,11000,6000,4000,February 2027
EMP004,40000,8000,3500,2000,February 2027
EMP005,70000,14000,8000,5000,February 2027
```

> ⚠️ `month_year` must be plain text like `February 2027`.
> If you use Excel and it auto-formats as a date, the backend handles the conversion automatically.

---

### Net Salary Calculations

| Employee | Base | HRA | Allowances | Deductions | Net |
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
| POST | `/api/employees/add` | Add single employee |
| POST | `/api/employees/upload` | Upload employee master CSV |

### Salary Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/salary` | Get all salary records |
| POST | `/api/salary/upload` | Upload monthly salary CSV |
| POST | `/api/salary/send-slips` | Generate PDFs and send emails |

---

## Deployment

### Frontend → Vercel

```bash
# In Vercel project settings → Environment Variables
VITE_API_URL = https://payrollflow-q1ha.onrender.com/api
```

### Backend → Render

```
Root Directory:  server
Build Command:   npm install
Start Command:   node index.js

Environment Variables:
MONGO_URI       = your atlas uri
RESEND_API_KEY  = your resend key
PORT            = 5000
```

### Database → MongoDB Atlas

MongoDB Atlas is fully cloud hosted — no deployment needed. Just create a free cluster, whitelist all IPs (`0.0.0.0/0`), and paste the connection string as `MONGO_URI`.

---

## Known Issues & Fixes

### 1. Render free tier blocks SMTP
**Problem:** Nodemailer stopped working on Render after September 26th, 2025 — Render blocked all outbound SMTP ports on free tier.
**Fix:** Switched to Resend HTTP API which bypasses SMTP entirely.

### 2. Excel date serial numbers
**Problem:** Excel converts `August 2026` typed in a date-formatted cell to a serial number like `46235`.
**Fix:** `parseMonthYear()` function in `salaryController.js` detects and converts serial numbers and short formats like `aug-26` to `August 2026`.

### 3. Render cold starts
**Problem:** Render free tier spins down after 15 mins of inactivity. First request takes 30-50 seconds.
**Fix:** Just wait and retry — it wakes up automatically.

### 4. uploads/ and slips/ folders
**Problem:** These folders don't exist on fresh Render deploys causing file upload errors.
**Fix:** `index.js` auto-creates both folders on server startup using `fs.mkdirSync`.

---

*Built for Nippon Toyota Internship — Task 1: Employee Salary Slip Automation System*

---

## 🧪 Evaluator Testing Guide

> No login required — the app opens directly to the dashboard.

### Step 1 — Prepare Employee Master CSV

Create a new file called `employee_master.csv` and paste this data into it.
**Replace `your_email@gmail.com` with your own email address** on all rows so you receive the salary slips.

```csv
emp_id,name,email,designation
EMP001,Arun Kumar,your_email@gmail.com,Software Engineer
EMP002,Priya Nair,your_email@gmail.com,UI Designer
EMP003,Rahul Menon,your_email@gmail.com,Backend Developer
EMP004,Sneha Das,your_email@gmail.com,QA Engineer
EMP005,Vikram Iyer,your_email@gmail.com,Product Manager
```

---

### Step 2 — Prepare Monthly Salary CSV

Create a new file called `salary_february_2027.csv` and paste this data into it. No changes needed here.

```csv
emp_id,base_salary,hra,allowances,deductions,month_year
EMP001,50000,10000,5000,3000,February 2027
EMP002,45000,9000,4000,2500,February 2027
EMP003,55000,11000,6000,4000,February 2027
EMP004,40000,8000,3500,2000,February 2027
EMP005,70000,14000,8000,5000,February 2027
```

---

### Step 3 — Run the Full Flow

1. Open **https://payroll-flow-seven.vercel.app**
2. Go to **Upload Employees** → upload `employee_master.csv`
3. Go to **Upload Salary** → upload `salary_february_2027.csv`
4. Go to **Send Slips** → select **February 2027** from the dropdown → click **Send All Slips**
5. Check your inbox — you should receive **5 emails** with PDF salary slip attachments ✅

---

### Expected Result

| Employee | Net Salary |
|---|---|
| EMP001 — Arun Kumar | ₹ 62,000 |
| EMP002 — Priya Nair | ₹ 55,500 |
| EMP003 — Rahul Menon | ₹ 68,000 |
| EMP004 — Sneha Das | ₹ 49,500 |
| EMP005 — Vikram Iyer | ₹ 87,000 |

> 💡 The first request may take 30–50 seconds if the server is waking up from idle (Render free tier). Just wait and retry.
