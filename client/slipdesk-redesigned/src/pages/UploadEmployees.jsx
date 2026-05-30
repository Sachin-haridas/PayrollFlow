import { useState, useRef } from 'react'
import axios from 'axios'

const BASE = 'http://localhost:5000/api'

export default function UploadEmployees() {
  const [file, setFile] = useState(null)
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('csv')
  const [form, setForm] = useState({ emp_id: '', name: '', email: '', designation: '' })
  const [manualLoading, setManualLoading] = useState(false)
  const [manualResult, setManualResult] = useState('')
  const fileRef = useRef()

  const handleFile = f => { setFile(f); setResult(null); setError('') }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); setError(''); setResult(null)
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await axios.post(`${BASE}/employees/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data); setFile(null)
    } catch (e) { setError(e.response?.data?.message || 'Upload failed.') }
    finally { setLoading(false) }
  }

  const handleManual = async () => {
    const { emp_id, name, email, designation } = form
    if (!emp_id || !name || !email || !designation) { setManualResult('error:All fields are required.'); return }
    setManualLoading(true); setManualResult('')
    try {
      await axios.post(`${BASE}/employees/add`, form)
      setManualResult('success:Employee added successfully!')
      setForm({ emp_id: '', name: '', email: '', designation: '' })
    } catch (e) { setManualResult(`error:${e.response?.data?.message || 'Failed to add employee.'}`) }
    finally { setManualLoading(false) }
  }

  const sampleCSV = `emp_id,name,email,designation\nEMP101,Riya Sharma,riya@company.com,Software Engineer\nEMP102,Arjun Nair,arjun@company.com,Product Manager`

  return (
    <div>
      <div className="page-header">
        <div className="step-badge">
          <span className="step-badge-num">1</span>
          <span>of 3 steps</span>
        </div>
        <h1 className="page-title">Employee <span className="highlight">Master</span></h1>
        <p className="page-sub">Upload a CSV or add employees manually — one-time setup</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button className={`btn ${mode === 'csv' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('csv')}>📁 CSV Upload</button>
        <button className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('manual')}>✏️ Add Manually</button>
      </div>

      {mode === 'csv' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
          <div>
            <div
              className={`upload-zone ${dragover ? 'dragover' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragover(true) }}
              onDragLeave={() => setDragover(false)}
              onDrop={e => { e.preventDefault(); setDragover(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              <div className="upload-icon-wrap">👥</div>
              <div className="upload-title">{file ? file.name : 'Drop employee CSV here, or click to browse'}</div>
              <div className="upload-sub">.csv or .xlsx — employee master data</div>
              {file && <span className="badge badge-teal" style={{ marginTop: '14px' }}>{(file.size / 1024).toFixed(1)} KB ready</span>}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={!file || loading} style={{ flex: 1, minWidth: '200px' }}>
                {loading ? <><span className="spinner"></span> Uploading…</> : '↑ Upload & Save Employees'}
              </button>
              {file && <button className="btn btn-ghost" onClick={() => { setFile(null); setResult(null); setError('') }}>Clear</button>}
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: '14px' }}>⚠ {error}</div>}

            {result && (
              <>
                <div className="alert alert-success" style={{ marginTop: '14px' }}>
                  ✓ {result.message} — <strong>{result.inserted}</strong> inserted, <strong>{result.updated}</strong> updated
                </div>
                {result.preview?.length > 0 && (
                  <div className="card" style={{ marginTop: '18px' }}>
                    <div className="section-head">
                      <span className="section-title">Preview</span>
                      <span className="badge badge-teal">{result.preview.length} employees</span>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Designation</th></tr></thead>
                        <tbody>
                          {result.preview.map((e, i) => (
                            <tr key={i}>
                              <td><span className="chip">{e.emp_id}</span></td>
                              <td className="primary">{e.name}</td>
                              <td style={{ color: 'var(--coral)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{e.email}</td>
                              <td>{e.designation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: '16px' }}>Required Columns</div>
            {['emp_id', 'name', 'email', 'designation'].map(col => (
              <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--coral)', borderRadius: '50%', flexShrink: 0 }}></span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--coral)' }}>{col}</code>
              </div>
            ))}
            <hr className="rule" />
            <div className="label">Sample CSV</div>
            <pre style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '12px', fontSize: '11px', color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.9 }}>{sampleCSV}</pre>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '12px', width: '100%' }}
              onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([sampleCSV], { type: 'text/csv' })); a.download = 'employee_sample.csv'; a.click() }}>
              ↓ Download Sample
            </button>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div style={{ maxWidth: '520px' }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: '24px' }}>Add Single Employee</div>
            {[
              { key: 'emp_id', label: 'Employee ID', placeholder: 'e.g. EMP101' },
              { key: 'name',   label: 'Full Name',   placeholder: 'e.g. Riya Sharma' },
              { key: 'email',  label: 'Email',       placeholder: 'e.g. riya@company.com', type: 'email' },
              { key: 'designation', label: 'Designation', placeholder: 'e.g. Software Engineer' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="label">{f.label}</label>
                <input className="input" type={f.type || 'text'} placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            {manualResult && (
              <div className={`alert ${manualResult.startsWith('success:') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '16px' }}>
                {manualResult.replace(/^(success|error):/, '')}
              </div>
            )}
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleManual} disabled={manualLoading}>
              {manualLoading ? <><span className="spinner"></span> Adding…</> : '+ Add Employee'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
