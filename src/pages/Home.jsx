import React from 'react'
import { Link } from 'react-router-dom'
import AppDownloadBanner from '../components/AppDownloadBanner'
import './Home.css'

const features = [
  {
    to: '/quran',
    icon: '📖',
    title: 'القرآن الكريم',
    desc: 'تصفح سور القرآن الكريم واقرأ الآيات',
    color: '#6bc077',
  },
  {
    to: '/audio',
    icon: '🎙️',
    title: 'القراء',
    desc: 'استمع لتلاوات المشاهير من القراء',
    color: '#5b8dee',
  },
  {
    to: '/prayer',
    icon: '🕌',
    title: 'مواقيت الصلاة',
    desc: 'أوقات الصلاة بدقة حسب موقعك',
    color: '#f3a049',
  },
  {
    to: '/adhkar',
    icon: '📿',
    title: 'الأذكار',
    desc: 'أذكار الصباح والمساء والأدعية',
    color: '#a779e9',
  },
  {
    to: '/hisnmuslim',
    icon: '🛡️',
    title: 'حصن المسلم',
    desc: 'أدعية وأذكار من حصن المسلم',
    color: '#e96979',
  },
  {
    to: '/radio',
    icon: '📻',
    title: 'الإذاعة',
    desc: 'إذاعات إسلامية مباشرة',
    color: '#49b8c8',
  },
]

export default function Home() {
  return (
    <div className="page-container fade-in">
      <div className="home-hero">
        <div className="home-hero-icon">☪️</div>
        <h1>نور الإسلام</h1>
        <p>تطبيق القرآن الكريم والأذكار الإسلامية</p>
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
