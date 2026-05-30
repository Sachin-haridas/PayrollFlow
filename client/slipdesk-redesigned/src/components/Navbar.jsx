import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Overview',      icon: '📊', emoji: '📊' },
  { id: 'employees',  label: 'Employees',     icon: '👥', emoji: '👥' },
  { id: 'salary',     label: 'Upload Salary', icon: '📤', emoji: '📤' },
  { id: 'records',    label: 'Records',       icon: '🗂️', emoji: '🗂️' },
  { id: 'send',       label: 'Send Slips',    icon: '✉️', emoji: '✉️' },
]

export default function Navbar({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNav = (id) => {
    setPage(id)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => handleNav('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="logo-mark">S</div>
          <div>
            <div className="logo-text">SmartPayroll</div>
            <div className="logo-sub">Payroll v1.0</div>
          </div>
        </div>

        {/* Desktop Nav links */}
        <div className="navbar-links">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`nav-btn ${page === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <div className="live-dot">LIVE</div>
          <div className="avatar">A</div>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
            <span style={{ opacity: menuOpen ? 0 : 1 }}></span>
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`mobile-nav-btn ${page === item.id ? 'active' : ''}`}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{item.label}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
