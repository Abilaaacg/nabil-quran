import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppDownloadBanner from '../components/AppDownloadBanner'
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

const features = [
  { to: '/quran',     icon: '📖', title: 'القرآن الكريم',   desc: 'تصفح وتلاوة سور القرآن الكريم',           color: '#6bc077' },
  { to: '/audio',     icon: '🎙️', title: 'القراء',          desc: 'استمع لأشهر القراء في العالم',              color: '#5b8dee' },
  { to: '/prayer',    icon: '🕌', title: 'مواقيت الصلاة',   desc: 'أوقات الصلاة بدقة حسب مدينتك',             color: '#f3a049' },
  { to: '/adhkar',    icon: '📿', title: 'الأذكار',          desc: 'أذكار الصباح والمساء وكل المناسبات',       color: '#a779e9' },
  { to: '/hisnmuslim',icon: '🛡️', title: 'حصن المسلم',      desc: 'أدعية وأذكار من حصن المسلم',               color: '#e96979' },
  { to: '/tasbeeh',   icon: '📿', title: 'عداد التسبيح',    desc: 'سبّح وذكّر الله باستخدام العداد الرقمي',   color: '#6bc077' },
  { to: '/names',     icon: '✨', title: 'أسماء الله الحسنى',desc: 'تعرف على أسماء الله الـ٩٩ ومعانيها',       color: '#f3d049' },
  { to: '/zakat',     icon: '💰', title: 'حاسبة الزكاة',    desc: 'احسب زكاة مالك بسهولة ودقة',               color: '#49c8a0' },
  { to: '/sunnah',    icon: '🌟', title: 'السنن المهجورة',  desc: '12 سنة نبوية مع الفوائد والأدلة',           color: '#49b8c8' },
  { to: '/challenge', icon: '🏆', title: 'التحدي اليومي',   desc: 'مهام يومية ونقاط لتحسين عباداتك',          color: '#e9a049' },
  { to: '/qibla',     icon: '🧭', title: 'اتجاه القبلة',    desc: 'اعرف اتجاه الكعبة بدقة',                   color: '#49a8e9' },
  { to: '/radio',     icon: '📻', title: 'الإذاعة',         desc: 'إذاعات إسلامية مباشرة من العالم',           color: '#b849c8' },
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

      {/* بانر تحميل التطبيق */}
      <AppDownloadBanner />

      <div className="home-grid">
        {features.map(f => (
          <Link key={f.to} to={f.to} className="home-card">
            <div className="home-card-icon" style={{ background: `${f.color}22`, color: f.color }}>
              {f.icon}
            </div>
            <h2>{f.title}</h2>
            <p>{f.desc}</p>
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
