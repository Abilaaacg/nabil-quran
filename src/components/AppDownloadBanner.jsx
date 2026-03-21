import { useState, useEffect } from 'react'
import './AppDownloadBanner.css'

// إخفاء البانر داخل تطبيق الأندرويد
const isNativeApp = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

export default function AppDownloadBanner() {
  const [release, setRelease] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (isNativeApp()) return // لا تظهر داخل التطبيق

    fetch('/version.json?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        if (data.version && data.version !== 'v0' && data.url) {
          setRelease(data)
        }
      })
      .catch(() => {})
  }, [])

  if (isNativeApp() || !release) return null

  const handleDownload = () => {
    setDownloading(true)
    window.location.href = release.url
    setTimeout(() => setDownloading(false), 3000)
  }

  return (
    <div className="apk-banner">
      <div className="apk-banner-glow" />

      <div className="apk-banner-inner">
        <div className="apk-icon-wrap">
          <div className="apk-icon-ring" />
          <div className="apk-icon">☪️</div>
        </div>

        <div className="apk-info">
          <div className="apk-title">نور الإسلام للأندرويد</div>
          <div className="apk-meta">
            <span className="apk-version">{release.version}</span>
            <span className="apk-dot">·</span>
            <span className="apk-badge">مجاني</span>
          </div>
        </div>

        <button
          className={`apk-download-btn ${downloading ? 'downloading' : ''}`}
          onClick={handleDownload}
        >
          {downloading ? (
            <><span className="apk-spinner" /> جاري التحميل</>
          ) : (
            <><span className="apk-download-icon">⬇</span> تحميل التطبيق</>
          )}
        </button>
      </div>

      <div className="apk-features">
        <span>📖 القرآن كاملاً</span>
        <span>🕌 مواقيت الصلاة</span>
        <span>📿 الأذكار</span>
        <span>📻 الإذاعة</span>
        <span>🎙️ القراء</span>
      </div>
    </div>
  )
}
