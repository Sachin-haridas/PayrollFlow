# SmartPayroll — Salary Slip Automation Frontend

A modern, production-grade React dashboard for the Salary Slip Automation System.

## Stack

- **React 18** + **Vite 5**
- **Axios** for API communication
- **DM Sans** + **Space Grotesk** fonts
- Dark-first design system with CSS variables

## Features

| Page | What it does |
|------|-------------|
| **Dashboard** | Live stats, employee roster, quick actions |
| **Employees** | Upload employee master CSV or add manually |
| **Upload Salary** | Import monthly salary CSV with preview table & totals |
| **Salary Records** | Browse all records with search + month filter |
| **Send Slips** | Select month → generate PDFs → email all employees → view send status |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Make sure your Express backend is running on port 5000
node index.js   # in your server/ folder

# 3. Start the frontend dev server
npm run dev
# → http://localhost:5173
```

## Backend API Endpoints Used

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/employees` | Fetch all employees |
| POST | `/api/employees/add` | Add single employee |
| POST | `/api/employees/upload` | Upload employee master CSV |
| GET | `/api/salary` | Fetch all salary records |
| POST | `/api/salary/upload` | Upload monthly salary CSV |
| POST | `/api/salary/send-slips` | Generate PDFs + send emails |

## Folder Structure

```
src/
├── pages/
│   ├── Dashboard.jsx       ← Overview + stats + roster
│   ├── UploadEmployees.jsx ← CSV upload + manual form
│   ├── UploadSalary.jsx    ← CSV upload + preview table
│   ├── SalaryRecords.jsx   ← Searchable salary history
│   └── SendSlips.jsx       ← Month picker + status table
├── components/
│   ├── Navbar.jsx          ← Sticky navigation
│   └── Toast.jsx           ← Notification system
├── App.jsx
├── main.jsx
└── index.css               ← Full design system
```

## Sample CSV Formats

### Employee Master
```csv
emp_id,name,email,designation
EMP101,Riya Sharma,riya@company.com,Software Engineer
EMP102,Arjun Nair,arjun@company.com,Product Manager
```

### Monthly Salary
```csv
emp_id,base_salary,hra,allowances,deductions,month_year
EMP101,50000,10000,5000,2000,May 2026
EMP102,60000,12000,4000,3000,May 2026
```

## .env (Backend)

```
MONGO_URI=mongodb+srv://...
EMAIL_USER=you@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```
