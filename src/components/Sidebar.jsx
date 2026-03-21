import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/', label: 'الرئيسية', icon: '🏠', end: true },
  { to: '/quran', label: 'القرآن الكريم', icon: '📖' },
  { to: '/audio', label: 'القراء', icon: '🎙️' },
  { to: '/prayer', label: 'مواقيت الصلاة', icon: '🕌' },
  { to: '/qibla',  label: 'اتجاه القبلة',  icon: '🧭' },
  { to: '/adhkar',   label: 'الأذكار',          icon: '📿' },
  { to: '/hisnmuslim', label: 'حصن المسلم',   icon: '🛡️' },
  { to: '/tasbeeh',  label: 'عداد التسبيح',    icon: '🔢' },
  { to: '/names',    label: 'أسماء الله الحسنى', icon: '✨' },
  { to: '/zakat',    label: 'حاسبة الزكاة',    icon: '💰' },
  { to: '/sunnah',   label: 'السنن المهجورة',  icon: '🌟' },
  { to: '/challenge',label: 'التحدي اليومي',   icon: '🏆' },
  { to: '/radio',    label: 'الإذاعة',          icon: '📻' },
  { to: '/settings', label: 'الإعدادات',        icon: '⚙️' },
]

export default function Sidebar() {
  const { theme, toggleTheme } = useApp()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">☪️</div>
        <div>
          <h1>نور الإسلام</h1>
          <span>Noor Al-Islam</span>
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

        <a
          href="https://nabil-quran.netlify.app"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary w-full"
          style={{ justifyContent: 'center', gap: 8, marginTop: 8, textDecoration: 'none' }}
        >
          🌐 تابعنا عبر الموقع
        </a>

        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 12,
          lineHeight: 1.6,
          fontFamily: 'var(--font-arabic)',
        }}>
          تم برمجة التطبيق<br />عن طريق المهندس أحمد نبيل
        </p>
      </div>
    </aside>
  )
}
