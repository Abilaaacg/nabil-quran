import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppDownloadBanner from '../components/AppDownloadBanner'
import NewsTicker from '../components/NewsTicker'
import SocialProof from '../components/SocialProof'
import './Home.css'

function toHijri(date) {
  // حساب التاريخ الهجري
  const jd = Math.floor((14 + 153 * (date.getMonth() + 1 > 2 ? date.getMonth() - 2 : date.getMonth() + 10) + 5) / 153)
    + 153 * Math.max(0, date.getMonth() - 2) / 5
  const n = 365 * date.getFullYear() + Math.floor(date.getFullYear() / 4)
    - Math.floor(date.getFullYear() / 100) + Math.floor(date.getFullYear() / 400)
    + date.getDate() + jd - 30
  const l = n - 1948440 + 10632
  const n1 = Math.floor((l - 1) / 10631)
  const l2 = l - 10631 * n1 + 354
  const j = Math.floor((10985 - l2) / 5316) * Math.floor(50 * l2 / 17719)
    + Math.floor(l2 / 5670) * Math.floor(43 * l2 / 15238)
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50)
    - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29
  const month = Math.floor(24 * l3 / 709)
  const day = l3 - Math.floor(709 * month / 24)
  const year = 30 * n1 + j - 30
  const months = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة']
  return `${day} ${months[month - 1]} ${year} هـ`
}

// الأيقونات الرئيسية (تدور حول المركز)
const mainFeatures = [
  { to: '/quran',     icon: '📖', title: 'القرآن',     color: '#6bc077' },
  { to: '/prayer',    icon: '🕌', title: 'الصلاة',     color: '#f3a049' },
  { to: '/adhkar',    icon: '📿', title: 'الأذكار',    color: '#a779e9' },
  { to: '/hisnmuslim',icon: '🛡️', title: 'حصن المسلم', color: '#e96979' },
  { to: '/audio',     icon: '🎙️', title: 'القراء',     color: '#5b8dee' },
  { to: '/qibla',     icon: '🧭', title: 'القبلة',     color: '#49a8e9' },
  { to: '/names',     icon: '✨', title: 'الأسماء',    color: '#f3d049' },
  { to: '/tasbeeh',   icon: '📿', title: 'التسبيح',    color: '#6bc077' },
]

// باقي الميزات
const moreFeatures = [
  { to: '/quiz',      icon: '🏆', title: 'المسابقة',   color: '#e96979' },
  { to: '/lessons',   icon: '🎓', title: 'الدروس',     color: '#8b5cf6' },
  { to: '/zakat',     icon: '💰', title: 'الزكاة',     color: '#49c8a0' },
  { to: '/sunnah',    icon: '🌟', title: 'السنن',      color: '#49b8c8' },
  { to: '/challenge', icon: '⭐', title: 'التحدي',     color: '#e9a049' },
  { to: '/radio',     icon: '📻', title: 'الإذاعة',    color: '#b849c8' },
]

export default function Home() {
  const [hijri, setHijri] = useState('')
  useEffect(() => { setHijri(toHijri(new Date())) }, [])

  return (
    <div className="page-container fade-in">
      <div className="home-hero">
        <div className="home-hero-icon">☪️</div>
        <h1>نور الإسلام</h1>
        <p>تطبيق القرآن الكريم والأذكار الإسلامية</p>
        {hijri && <div className="home-hijri">{hijri}</div>}
      </div>

      <NewsTicker />

      {/* بانر تحميل التطبيق */}
      <AppDownloadBanner />

      {/* الدائرة الدوارة */}
      <div className="home-orbit">
        <div className="home-orbit-center">☪️</div>
        <div className="home-orbit-ring">
          {mainFeatures.map((f, i) => {
            const angle = (i * 360 / mainFeatures.length) - 90
            const rad = angle * Math.PI / 180
            return (
              <Link key={f.to} to={f.to} className="home-orbit-item"
                style={{
                  '--x': `${Math.cos(rad) * 115}px`,
                  '--y': `${Math.sin(rad) * 115}px`,
                  animationDelay: `${i * 0.1}s`,
                }}>
                <div className="home-orbit-inner">
                  <div className="home-orbit-icon" style={{ background: `${f.color}20`, borderColor: `${f.color}60` }}>
                    {f.icon}
                  </div>
                  <span className="home-orbit-label">{f.title}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ميزات إضافية */}
      <div className="home-more">
        {moreFeatures.map(f => (
          <Link key={f.to} to={f.to} className="home-more-item">
            <div className="home-more-icon" style={{ background: `${f.color}20`, borderColor: `${f.color}50` }}>
              {f.icon}
            </div>
            <span>{f.title}</span>
          </Link>
        ))}
      </div>

      <SocialProof />

      <div className="home-footer">
        <p>بسم الله الرحمن الرحيم</p>
        <p style={{ fontSize: 12, marginTop: 8, color: 'var(--text-muted)' }}>
          تم برمجة التطبيق عن طريق المهندس أحمد نبيل
        </p>
        <a
          href="https://nabil-quran.netlify.app"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, display: 'block' }}
        >
          🌐 تابعنا عبر الموقع
        </a>
      </div>
    </div>
  )
}
