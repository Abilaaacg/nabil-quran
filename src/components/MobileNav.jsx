import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',        label: 'الرئيسية', icon: '🏠', end: true },
  { to: '/quran',   label: 'القرآن',   icon: '📖' },
  { to: '/prayer',  label: 'الصلاة',   icon: '🕌' },
  { to: '/adhkar',  label: 'الأذكار',  icon: '📿' },
  { to: '/settings',label: 'إعدادات', icon: '⚙️' },
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
