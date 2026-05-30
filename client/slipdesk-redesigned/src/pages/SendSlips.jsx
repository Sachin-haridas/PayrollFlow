import { useState, useEffect } from 'react'
import axios from 'axios'
import BASE from '../config/api'

export default function SendSlips() {
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingMonths, setFetchingMonths] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`${BASE}/salary`)
      .then(res => {
        const records = res.data.records || []
        // Prefer server-ordered months (by most recent CSV upload); fallback for older API
        const m = res.data.months?.length
          ? res.data.months
          : (() => {
              const seen = new Set()
              const ordered = []
              for (const r of [...records].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))) {
                if (!seen.has(r.month_year)) {
                  seen.add(r.month_year)
                  ordered.push(r.month_year)
                }
              }
              return ordered
            })()
        setMonths(m)
        if (m.length > 0) setSelectedMonth(m[0])
      })
      .catch(() => {})
      .finally(() => setFetchingMonths(false))
  }, [])

  const handleSend = async () => {
    if (!selectedMonth) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post(`${BASE}/salary/send-slips`, { month_year: selectedMonth })
      setResult(res.data)
    } catch (e) { setError(e.response?.data?.message || 'Failed to send. Check server logs.') }
    finally { setLoading(false) }
  }

  const handleSendMonth = async (month) => {
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post(`${BASE}/salary/send-slips`, { month_year: month })
      setResult(res.data)
    } catch (e) { setError(e.response?.data?.message || 'Failed to send. Check server logs.') }
    finally { setLoading(false) }
  }

  const sent   = result?.report?.filter(r => r.status === 'sent')   || []
  const failed = result?.report?.filter(r => r.status === 'failed') || []

  const PIPELINE = [
    { num: '01', text: 'Fetch salary records for', accent: selectedMonth, color: 'var(--violet)' },
    { num: '02', text: 'Match employee master data', color: 'var(--coral)' },
    { num: '03', text: 'Generate PDF slip via pdfkit', color: 'var(--amber)' },
    { num: '04', text: 'Email PDF to each employee', color: 'var(--teal)' },
    { num: '05', text: 'Return success / failure report', color: 'var(--lime)' },
  ]

  return (
    <div>
      <div className="page-header">
        <div className="step-badge">
          <span className="step-badge-num">3</span>
          <span>of 3 steps</span>
        </div>
        <h1 className="page-title">Send <span className="highlight">Salary Slips</span></h1>
        <p className="page-sub">Generate PDFs and dispatch them to every employee via email</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="section-title" style={{ marginBottom: '22px' }}>Select Payroll Month</div>

            {fetchingMonths ? (
              <div style={{ color: 'var(--ink-2)', fontSize: '14px' }}>Fetching available months…</div>
            ) : months.length === 0 ? (
              <div className="alert alert-warning">⚠ No salary records found. Upload salary data first.</div>
            ) : (
              <>
                <div className="form-group">
                  <label className="label">Select Month</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-success btn-lg"
                      style={{ flex: 1 }}
                      onClick={() => { setSelectedMonth(months[0]); handleSend(); }}
                      disabled={loading}
                    >
                      {loading ? <><span className="spinner"></span> Sending…</> : `✉️ Send Latest: ${months[0]}`}
                    </button>
                    <select
                      className="input select"
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {selectedMonth !== months[0] && (
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: '20px' }}
                    onClick={handleSend}
                    disabled={loading}
                  >
                    {loading ? <><span className="spinner"></span> Generating & sending…</> : `✉️ Send Slips — ${selectedMonth}`}
                  </button>
                )}
              </>
            )}

          {error && <div className="alert alert-error" style={{ marginBottom: '18px' }}>⚠ {error}</div>}

          {result && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '18px' }}>
                {[
                  { label: 'Total', val: result.summary?.total, iconBg: 'rgba(124,58,237,0.1)', color: 'var(--violet)', icon: '📋' },
                  { label: 'Sent',  val: result.summary?.sent,  iconBg: 'rgba(13,148,136,0.1)',  color: 'var(--teal)',   icon: '✅' },
                  { label: 'Failed',val: result.summary?.failed,iconBg: 'rgba(220,38,38,0.1)',   color: 'var(--red)',    icon: '❌' },
                ].map(item => (
                  <div key={item.label} className="stat-card">
                    <div className="stat-icon" style={{ background: item.iconBg }}>{item.icon}</div>
                    <div className="stat-label">{item.label}</div>
                    <div className="stat-value" style={{ color: item.color, fontSize: '32px' }}>{item.val}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-head">
                  <span className="section-title">Dispatch Report</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge badge-success">✓ {sent.length}</span>
                    {failed.length > 0 && <span className="badge badge-danger">✕ {failed.length}</span>}
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Note</th></tr>
                    </thead>
                    <tbody>
                      {result.report?.map((r, i) => (
                        <tr key={i}>
                          <td><span className="chip">{r.emp_id}</span></td>
                          <td className="primary">{r.name || '—'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--coral)' }}>{r.email || '—'}</td>
                          <td>
                            <span className={`badge ${r.status === 'sent' ? 'badge-success' : 'badge-danger'}`}>
                              {r.status === 'sent' ? '✓ SENT' : '✕ FAILED'}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{r.reason || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
            </div>
        </div>
      </div>
    </div>
  )
}
