import { useEffect, useState } from 'react'
import axios from 'axios'

const BASE = 'http://localhost:5000/api'

function StatCard({ label, value, icon, iconBg, valueColor, sub }) {
  return (
    <div className="stat-card">
      <div
        className="stat-card-accent"
        style={{ background: valueColor }}
      ></div>
      <div className="stat-icon" style={{ background: iconBg, fontSize: '20px' }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: valueColor }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function Dashboard({ setPage }) {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE}/employees`).catch(() => ({ data: { employees: [] } })),
      axios.get(`${BASE}/salary`).catch(() => ({ data: { records: [] } })),
    ]).then(([e, s]) => {
      setEmployees(e.data.employees || [])
      setRecords(s.data.records || [])
      setLoading(false)
    })
  }, [])

  const totalPayroll = records.reduce((s, r) => s + (r.net_salary || 0), 0)
  const months = [...new Set(records.map(r => r.month_year))].length
  const empMap = {}
  employees.forEach(e => empMap[e.emp_id] = e)
  const recent = records.slice(0, 6)

  const ACTIONS = [
    { icon: '👥', label: 'Upload Employee Master', sub: 'Add or update employee records', page: 'employees', iconBg: 'rgba(124,58,237,0.1)', color: 'var(--violet)' },
    { icon: '📤', label: 'Upload Salary Data', sub: 'Import monthly payroll CSV', page: 'salary', iconBg: 'rgba(240,90,42,0.1)', color: 'var(--coral)' },
    { icon: '🗂️', label: 'View Salary Records', sub: 'Browse all processed salary history', page: 'records', iconBg: 'rgba(13,148,136,0.1)', color: 'var(--teal)' },
    { icon: '✉️', label: 'Send Salary Slips', sub: 'Generate PDFs and email employees', page: 'send', iconBg: 'rgba(217,119,6,0.1)', color: 'var(--amber)' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-eyebrow">✦ Admin Dashboard</div>
          <h1 className="page-title">
            Payroll <span className="highlight">Overview</span>
          </h1>
          <p className="page-sub">Everything at a glance — employees, records & dispatch</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage('salary')}>↑ Upload CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setPage('send')}>Send Slips ✉️</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Employees" value={loading ? '—' : employees.length} icon="👥" iconBg="rgba(124,58,237,0.1)" valueColor="var(--violet)" sub="on master list" />
        <StatCard label="Salary Records" value={loading ? '—' : records.length} icon="🗂️" iconBg="rgba(13,148,136,0.1)" valueColor="var(--teal)" sub="total entries" />
        <StatCard label="Months" value={loading ? '—' : months} icon="📅" iconBg="rgba(101,163,13,0.1)" valueColor="var(--lime)" sub="processed" />
        <StatCard
          label="Total Payroll"
          value={loading ? '—' : `₹${(totalPayroll / 100000).toFixed(1)}L`}
          icon="💰"
          iconBg="rgba(217,119,6,0.1)"
          valueColor="var(--amber)"
          sub="all time"
        />
      </div>

      {/* Two cols */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Recent Records */}
        <div className="card">
          <div className="section-head">
            <span className="section-title">Recent Records</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('records')}>All records →</button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '56px', color: 'var(--ink-3)' }}>
              <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--coral)', borderColor: 'rgba(240,90,42,0.2)' }}></div>
            </div>
          ) : recent.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🗂️</div>
              <div className="empty-text">No salary records yet</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Employee</th><th>Role</th><th>Month</th><th>Net Pay</th></tr>
                </thead>
                <tbody>
                  {recent.map(r => {
                    const emp = empMap[r.emp_id]
                    return (
                      <tr key={r._id}>
                        <td className="primary">{emp?.name || r.emp_id}</td>
                        <td style={{ fontSize: '12px' }}>{emp?.designation || '—'}</td>
                        <td><span className="badge badge-info">{r.month_year}</span></td>
                        <td className="money" style={{ color: 'var(--teal)' }}>₹{r.net_salary?.toLocaleString('en-IN')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="section-head">
            <span className="section-title">Quick Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ACTIONS.map(item => (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className="action-btn"
              >
                <div className="action-icon" style={{ background: item.iconBg }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '1px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{item.sub}</div>
                </div>
                <span style={{ color: item.color, fontSize: '18px', fontWeight: 700, flexShrink: 0 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Employee table */}
      <div className="card">
        <div className="section-head">
          <span className="section-title">Employee Roster</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!loading && <span className="badge badge-teal">{employees.length} total</span>}
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('employees')}>Manage →</button>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)' }}>Loading…</div>
        ) : employees.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👥</div>
            <div className="empty-text">No employees yet — upload an employee master CSV to begin.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Designation</th></tr>
              </thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e._id}>
                    <td><span className="chip">{e.emp_id}</span></td>
                    <td className="primary">{e.name}</td>
                    <td style={{ color: 'var(--coral)', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>{e.email}</td>
                    <td>{e.designation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
