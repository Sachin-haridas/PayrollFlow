import { useState, useRef } from 'react'
import axios from 'axios'
import BASE from '../config/api'
const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function UploadSalary() {
  const [file, setFile] = useState(null)
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const sampleCSV = `emp_id,base_salary,hra,allowances,deductions,month_year\nEMP101,50000,10000,5000,2000,May 2026\nEMP102,60000,12000,4000,3000,May 2026\nEMP103,55000,11000,4500,2500,June 2026`

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); setError(''); setResult(null)
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await axios.post(`${BASE}/salary/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data); setFile(null)
    } catch (e) { setError(e.response?.data?.message || 'Upload failed. Ensure employees exist in master first.') }
    finally { setLoading(false) }
  }

  const totalGross = result?.preview?.reduce((s, r) => s + r.base_salary + r.hra + r.allowances, 0) || 0
  const totalDed   = result?.preview?.reduce((s, r) => s + r.deductions, 0) || 0
  const totalNet   = result?.preview?.reduce((s, r) => s + r.net_salary, 0) || 0

  return (
    <div>
      <div className="page-header">
        <div className="step-badge">
          <span className="step-badge-num">2</span>
          <span>of 3 steps</span>
        </div>
        <h1 className="page-title">Monthly <span className="highlight">Salary</span> Upload</h1>
        <p className="page-sub">Import monthly payroll data — month is read directly from your CSV</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        <div>
          <div
            className={`upload-zone ${dragover ? 'dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragover(true) }}
            onDragLeave={() => setDragover(false)}
            onDrop={e => { e.preventDefault(); setDragover(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setResult(null); setError('') } }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={e => { setFile(e.target.files[0]); setResult(null); setError('') }} />
            <div className="upload-icon-wrap">📊</div>
            <div className="upload-title">{file ? file.name : 'Drop monthly salary CSV here'}</div>
            <div className="upload-sub">Include month_year column · .csv or .xlsx</div>
            {file && <span className="badge badge-teal" style={{ marginTop: '14px' }}>{(file.size / 1024).toFixed(1)} KB ready</span>}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={!file || loading} style={{ flex: 1, minWidth: '200px' }}>
              {loading ? <><span className="spinner"></span> Processing…</> : '↑ Upload & Process Salary Data'}
            </button>
            {file && <button className="btn btn-ghost" onClick={() => { setFile(null); setResult(null); setError('') }}>Clear</button>}
          </div>

          {error && <div className="alert alert-error" style={{ marginTop: '14px' }}>⚠ {error}</div>}

          {result && (
            <>
              <div className="alert alert-success" style={{ marginTop: '14px' }}>
                ✓ {result.message} — <strong>{result.inserted}</strong> new · <strong>{result.updated}</strong> updated · <strong>{result.total}</strong> total
                {result.uploaded_months?.length > 0 && (
                  <span> · Months: <strong>{result.uploaded_months.join(', ')}</strong></span>
                )}
              </div>

              {result.preview?.length > 0 && (
                <div className="card" style={{ marginTop: '18px' }}>
                  <div className="section-head">
                    <span className="section-title">Salary Preview</span>
                    {result.uploaded_months?.length === 1 && <span className="badge badge-info">{result.uploaded_months[0]}</span>}
                    {result.uploaded_months?.length > 1 && <span className="badge badge-info">{result.uploaded_months.length} months</span>}
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Emp ID</th><th>Base</th><th>HRA</th><th>Allowances</th><th>Deductions</th><th>Month</th><th>Net Pay</th></tr>
                      </thead>
                      <tbody>
                        {result.preview.map((r, i) => (
                          <tr key={i}>
                            <td><span className="chip">{r.emp_id}</span></td>
                            <td className="money">{fmt(r.base_salary)}</td>
                            <td className="money">{fmt(r.hra)}</td>
                            <td className="money">{fmt(r.allowances)}</td>
                            <td className="money" style={{ color: 'var(--red)' }}>−{fmt(r.deductions)}</td>
                            <td style={{ fontSize: '12px', color: 'var(--ink-2)' }}>{r.month_year}</td>
                            <td className="money" style={{ color: 'var(--teal)', fontWeight: 700 }}>{fmt(r.net_salary)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary bar */}
                  <div style={{
                    marginTop: '16px',
                    padding: '20px',
                    background: 'var(--bg-2)',
                    borderRadius: 'var(--r-sm)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                  }}>
                    {[
                      { label: 'Total Gross', val: totalGross, color: 'var(--ink)' },
                      { label: 'Total Deductions', val: totalDed, color: 'var(--red)' },
                      { label: 'Total Net Pay', val: totalNet, color: 'var(--teal)' },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: 'center' }}>
                        <div className="label">{item.label}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: item.color, marginTop: '4px' }}>
                          {fmt(item.val)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: '16px' }}>Required Columns</div>
          {['emp_id', 'base_salary', 'hra', 'allowances', 'deductions', 'month_year'].map(col => (
            <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--coral)', borderRadius: '50%', flexShrink: 0 }}></span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--coral)' }}>{col}</code>
            </div>
          ))}
          <div className="alert alert-warning" style={{ marginTop: '14px', fontSize: '12.5px' }}>
            ⚠ <strong>month_year</strong> must be in your CSV (e.g. <em>May 2026</em>, <em>Jun-26</em>). It will be auto-detected.
          </div>
          <hr className="rule" />
          <div className="label" style={{ marginBottom: '8px' }}>Net Pay Formula</div>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-2)', lineHeight: 2.2 }}>
            Net = Base + HRA<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ Allowances<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− Deductions
          </div>
          <hr className="rule" />
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}
            onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([sampleCSV], { type: 'text/csv' })); a.download = 'salary_sample.csv'; a.click() }}>
            ↓ Download Sample CSV
          </button>
        </div>
      </div>
    </div>
  )
}

// import { useState, useRef } from 'react'
// import axios from 'axios'

// const BASE = 'http://localhost:5000/api'
// const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

// export default function UploadSalary() {
//   const [file, setFile]         = useState(null)
//   const [dragover, setDragover] = useState(false)
//   const [loading, setLoading]   = useState(false)
//   const [result, setResult]     = useState(null)
//   const [error, setError]       = useState('')
//   const fileRef = useRef()

//   // month_year is no longer entered manually — it comes from the CSV itself
//   const sampleCSV = `emp_id,base_salary,hra,allowances,deductions,month_year\nEMP101,50000,10000,5000,2000,May 2026\nEMP102,60000,12000,4000,3000,May 2026`

//   const handleUpload = async () => {
//     if (!file) return
//     setLoading(true); setError(''); setResult(null)
//     const fd = new FormData()
//     fd.append('file', file)
//     // ← NO month_year in form data anymore; backend reads it from CSV rows
//     try {
//       const res = await axios.post(`${BASE}/salary/upload`, fd, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       })
//       setResult(res.data)
//       setFile(null)
//     } catch (e) {
//       setError(e.response?.data?.message || 'Upload failed. Ensure employees exist in master first.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const totalGross = result?.preview?.reduce((s, r) => s + r.base_salary + r.hra + r.allowances, 0) || 0
//   const totalDed   = result?.preview?.reduce((s, r) => s + r.deductions, 0) || 0
//   const totalNet   = result?.preview?.reduce((s, r) => s + r.net_salary, 0) || 0

//   return (
//     <div>
//       <div className="page-header">
//         <div className="step-badge">
//           <span className="step-badge-num">2</span>
//           <span>of 3 steps</span>
//         </div>
//         <h1 className="page-title">Monthly <span className="highlight">Salary</span> Upload</h1>
//         <p className="page-sub">Import monthly payroll data — month is read directly from your CSV</p>
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
//         <div>
//           <div
//             className={`upload-zone ${dragover ? 'dragover' : ''}`}
//             onDragOver={e => { e.preventDefault(); setDragover(true) }}
//             onDragLeave={() => setDragover(false)}
//             onDrop={e => {
//               e.preventDefault(); setDragover(false)
//               const f = e.dataTransfer.files[0]
//               if (f) { setFile(f); setResult(null); setError('') }
//             }}
//             onClick={() => fileRef.current?.click()}
//           >
//             <input
//               ref={fileRef} type="file" accept=".csv,.xlsx"
//               style={{ display: 'none' }}
//               onChange={e => { setFile(e.target.files[0]); setResult(null); setError('') }}
//             />
//             <div className="upload-icon-wrap">📊</div>
//             <div className="upload-title">{file ? file.name : 'Drop monthly salary CSV here'}</div>
//             <div className="upload-sub">One file per month · .csv or .xlsx · month_year must be in the CSV</div>
//             {file && <span className="badge badge-teal" style={{ marginTop: '14px' }}>{(file.size / 1024).toFixed(1)} KB ready</span>}
//           </div>

//           <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
//             <button
//               className="btn btn-primary btn-lg"
//               onClick={handleUpload}
//               disabled={!file || loading}
//               style={{ flex: 1, minWidth: '200px' }}
//             >
//               {loading ? <><span className="spinner"></span> Processing…</> : '↑ Upload & Process Salary Data'}
//             </button>
//             {file && (
//               <button className="btn btn-ghost" onClick={() => { setFile(null); setResult(null); setError('') }}>
//                 Clear
//               </button>
//             )}
//           </div>

//           {error && <div className="alert alert-error" style={{ marginTop: '14px' }}>⚠ {error}</div>}

//           {result && (
//             <>
//               <div className="alert alert-success" style={{ marginTop: '14px' }}>
//                 ✓ {result.message} — <strong>{result.inserted}</strong> new · <strong>{result.updated}</strong> updated · <strong>{result.total}</strong> total
//                 {result.uploaded_months?.length > 0 && (
//                   <span> · Month detected: <strong>{result.uploaded_months.join(', ')}</strong></span>
//                 )}
//               </div>

//               {result.preview?.length > 0 && (
//                 <div className="card" style={{ marginTop: '18px' }}>
//                   <div className="section-head">
//                     <span className="section-title">Salary Preview</span>
//                     <span className="badge badge-info">{result.preview[0]?.month_year}</span>
//                   </div>
//                   <div className="table-wrap">
//                     <table>
//                       <thead>
//                         <tr>
//                           <th>Emp ID</th><th>Base</th><th>HRA</th>
//                           <th>Allowances</th><th>Deductions</th><th>Net Pay</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {result.preview.map((r, i) => (
//                           <tr key={i}>
//                             <td><span className="chip">{r.emp_id}</span></td>
//                             <td className="money">{fmt(r.base_salary)}</td>
//                             <td className="money">{fmt(r.hra)}</td>
//                             <td className="money">{fmt(r.allowances)}</td>
//                             <td className="money" style={{ color: 'var(--red)' }}>−{fmt(r.deductions)}</td>
//                             <td className="money" style={{ color: 'var(--teal)', fontWeight: 700 }}>{fmt(r.net_salary)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>

//                   <div style={{
//                     marginTop: '16px', padding: '20px',
//                     background: 'var(--bg-2)', borderRadius: 'var(--r-sm)',
//                     display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
//                   }}>
//                     {[
//                       { label: 'Total Gross',      val: totalGross, color: 'var(--ink)' },
//                       { label: 'Total Deductions', val: totalDed,   color: 'var(--red)' },
//                       { label: 'Total Net Pay',    val: totalNet,   color: 'var(--teal)' },
//                     ].map(item => (
//                       <div key={item.label} style={{ textAlign: 'center' }}>
//                         <div className="label">{item.label}</div>
//                         <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: item.color, marginTop: '4px' }}>
//                           {fmt(item.val)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Sidebar */}
//         <div className="card">
//           <div className="section-title" style={{ marginBottom: '16px' }}>Required CSV Columns</div>
//           {['emp_id', 'base_salary', 'hra', 'allowances', 'deductions', 'month_year'].map(col => (
//             <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
//               <span style={{ width: '8px', height: '8px', background: 'var(--coral)', borderRadius: '50%', flexShrink: 0 }}></span>
//               <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--coral)' }}>{col}</code>
//             </div>
//           ))}
//           <div className="alert alert-warning" style={{ marginTop: '14px', fontSize: '12.5px' }}>
//             ⚠ <strong>month_year</strong> must be in your CSV (e.g. <em>May 2026</em>). It will be auto-detected.
//           </div>
//           <hr className="rule" />
//           <div className="label" style={{ marginBottom: '8px' }}>Net Pay Formula</div>
//           <div style={{
//             background: 'var(--bg-2)', border: '1px solid var(--border)',
//             borderRadius: 'var(--r-sm)', padding: '14px',
//             fontFamily: 'var(--font-mono)', fontSize: '12px',
//             color: 'var(--ink-2)', lineHeight: 2.2,
//           }}>
//             Net = Base + HRA<br />
//             &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ Allowances<br />
//             &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− Deductions
//           </div>
//           <hr className="rule" />
//           <button
//             className="btn btn-ghost btn-sm"
//             style={{ width: '100%' }}
//             onClick={() => {
//               const a = document.createElement('a')
//               a.href = URL.createObjectURL(new Blob([sampleCSV], { type: 'text/csv' }))
//               a.download = 'salary_sample.csv'
//               a.click()
//             }}
//           >
//             ↓ Download Sample CSV
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

