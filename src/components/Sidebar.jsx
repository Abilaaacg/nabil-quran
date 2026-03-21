import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/', label: 'الرئيسية', icon: '🏠', end: true },
  { to: '/quran', label: 'القرآن الكريم', icon: '📖' },
  { to: '/audio', label: 'القراء', icon: '🎙️' },
  { to: '/prayer', label: 'مواقيت الصلاة', icon: '🕌' },
  { to: '/adhkar', label: 'الأذكار', icon: '📿' },
  { to: '/hisnmuslim', label: 'حصن المسلم', icon: '🛡️' },
  { to: '/radio', label: 'الإذاعة', icon: '📻' },
  { to: '/settings', label: 'الإعدادات', icon: '⚙️' },
]

export default function Sidebar() {
  const { theme, toggleTheme } = useApp()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">📖</div>
        <div>
          <h1>نبيل قرآن</h1>
          <span>Nabil Quran</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={toggleTheme}
          className="btn btn-secondary w-full"
          style={{ justifyContent: 'center', gap: 8 }}
        >
          {theme === 'dark' ? '☀️ وضع النهار' : '🌙 وضع الليل'}
        </button>
      </div>
    </aside>
  )
}
