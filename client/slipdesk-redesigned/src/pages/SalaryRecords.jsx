import { useEffect, useState } from 'react'
import axios from 'axios'
import BASE from '../config/api'
const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function SalaryRecords() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [availableMonths, setAvailableMonths] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState('all')

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE}/salary`).catch(() => ({ data: { records: [] } })),
      axios.get(`${BASE}/employees`).catch(() => ({ data: { employees: [] } })),
    ]).then(([s, e]) => {
      setRecords(s.data.records || [])
      setAvailableMonths(s.data.months || [])
      setEmployees(e.data.employees || [])
      setLoading(false)
    })
  }, [])

  const empMap = {}
  employees.forEach(e => empMap[e.emp_id] = e)
  const months = ['all', ...(availableMonths.length
    ? availableMonths
    : [...new Set(records.map(r => r.month_year))].sort().reverse())]

  const filtered = records.filter(r => {
    const emp = empMap[r.emp_id]
    const ok = !search || r.emp_id.toLowerCase().includes(search.toLowerCase()) || emp?.name?.toLowerCase().includes(search.toLowerCase())
    return ok && (filterMonth === 'all' || r.month_year === filterMonth)
  })

  const totalNet = filtered.reduce((s, r) => s + (r.net_salary || 0), 0)

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-eyebrow">📋 History</div>
          <h1 className="page-title">Salary <span className="highlight">Records</span></h1>
          <p className="page-sub">Browse all processed payroll data across months</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Records', value: records.length, icon: '🗂️', iconBg: 'rgba(13,148,136,0.1)', color: 'var(--teal)' },
          { label: 'Filtered',      value: filtered.length, icon: '🔍', iconBg: 'rgba(101,163,13,0.1)', color: 'var(--lime)' },
          { label: 'Net Pay',       value: fmt(totalNet),   icon: '💰', iconBg: 'rgba(217,119,6,0.1)',  color: 'var(--amber)', small: true },
          { label: 'Months',        value: months.length - 1, icon: '📅', iconBg: 'rgba(240,90,42,0.1)', color: 'var(--coral)' },
        ].map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.iconBg }}>{card.icon}</div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value" style={{ color: card.color, fontSize: card.small ? '22px' : undefined, marginTop: card.small ? '10px' : undefined }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="🔍 Search by ID or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="input select" style={{ width: '180px' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{m === 'all' ? 'All Months' : m}</option>)}
          </select>
          {(search || filterMonth !== 'all') && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterMonth('all') }}>✕ Clear</button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '72px', color: 'var(--ink-3)' }}>
            <div className="spinner" style={{ margin: '0 auto 14px', width: '28px', height: '28px', borderTopColor: 'var(--coral)', borderColor: 'rgba(240,90,42,0.2)' }}></div>
            Loading records…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🗂️</div>
            <div className="empty-text">{records.length === 0 ? 'No records yet — upload salary data to begin.' : 'No records match your filters.'}</div>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Role</th><th>Month</th><th>Base</th><th>HRA</th><th>Allowances</th><th>Deductions</th><th>Net Pay</th></tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const emp = empMap[r.emp_id]
                    return (
                      <tr key={r._id || i}>
                        <td><span className="chip">{r.emp_id}</span></td>
                        <td className="primary">{emp?.name || '—'}</td>
                        <td style={{ fontSize: '12px' }}>{emp?.designation || '—'}</td>
                        <td><span className="badge badge-info">{r.month_year}</span></td>
                        <td className="money">{fmt(r.base_salary)}</td>
                        <td className="money">{fmt(r.hra)}</td>
                        <td className="money">{fmt(r.allowances)}</td>
                        <td className="money" style={{ color: 'var(--red)' }}>−{fmt(r.deductions)}</td>
                        <td className="money" style={{ color: 'var(--teal)', fontWeight: 700 }}>{fmt(r.net_salary)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary footer */}
            <div style={{ marginTop: '16px', padding: '16px 20px', background: 'var(--bg-2)', borderRadius: 'var(--r-sm)', display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
              {[
                { label: 'Avg Base', val: Math.round(filtered.reduce((s,r)=>s+r.base_salary,0)/filtered.length) },
                { label: 'Avg HRA', val: Math.round(filtered.reduce((s,r)=>s+r.hra,0)/filtered.length) },
                { label: 'Avg Net', val: Math.round(filtered.reduce((s,r)=>s+(r.net_salary||0),0)/filtered.length) },
                { label: 'Total Payroll', val: totalNet },
              ].map(item => (
                <div key={item.label}>
                  <div className="label">{item.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginTop: '3px', letterSpacing: '-0.02em' }}>{fmt(item.val)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
