import { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import UploadEmployees from './pages/UploadEmployees'
import UploadSalary from './pages/UploadSalary'
import SendSlips from './pages/SendSlips'
import SalaryRecords from './pages/SalaryRecords'
import './index.css'

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    employees: <UploadEmployees />,
    salary: <UploadSalary />,
    send: <SendSlips />,
    records: <SalaryRecords />,
  }

  return (
    <div className="app-shell">
      <Navbar page={page} setPage={setPage} />
      <main className="main-content">
        {pages[page]}
      </main>
    </div>
  )
}
