import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'الرئيسية', icon: '🏠', end: true },
  { to: '/quran', label: 'القرآن', icon: '📖' },
  { to: '/audio', label: 'القراء', icon: '🎙️' },
  { to: '/prayer', label: 'الصلاة', icon: '🕌' },
  { to: '/qibla',  label: 'القبلة',  icon: '🧭' },
  { to: '/adhkar', label: 'الأذكار', icon: '📿' },
  { to: '/radio', label: 'الإذاعة', icon: '📻' },
]

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
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
  )
}
