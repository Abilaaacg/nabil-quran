import { useState, useEffect } from 'react'
import './AppDownloadBanner.css'

export default function AppDownloadBanner() {
  const [release, setRelease] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetch('https://api.github.com/repos/Abilaaacg/nabil-quran/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' }
    })
      .then(r => r.json())
      .then(data => {
        const apk = data.assets?.find(a => a.name?.endsWith('.apk'))
        if (apk) {
          setRelease({
            version: data.tag_name,
            url: apk.browser_download_url,
            size: (apk.size / 1024 / 1024).toFixed(1),
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleDownload = () => {
    if (!release) return
    setDownloading(true)
    window.location.href = release.url
    setTimeout(() => setDownloading(false), 3000)
  }

  if (!release) return null

  return (
    <div className="apk-banner">
      <div className="apk-banner-glow" />

      <div className="apk-banner-inner">
        {/* أيقونة */}
        <div className="apk-icon-wrap">
          <div className="apk-icon-ring" />
          <div className="apk-icon">☪️</div>
        </div>

        {/* معلومات */}
        <div className="apk-info">
          <div className="apk-title">نور الإسلام للأندرويد</div>
          <div className="apk-meta">
            <span className="apk-version">{release.version}</span>
            <span className="apk-dot">·</span>
            <span>{release.size} MB</span>
            <span className="apk-dot">·</span>
            <span className="apk-badge">مجاني</span>
          </div>
        </div>

        {/* زرار التحميل */}
        <button
          className={`apk-download-btn ${downloading ? 'downloading' : ''}`}
          onClick={handleDownload}
        >
          {downloading ? (
            <>
              <span className="apk-spinner" />
              جاري التحميل
            </>
          ) : (
            <>
              <span className="apk-download-icon">⬇</span>
              تحميل التطبيق
            </>
          )}
        </button>
      </div>

      {/* شريط الميزات */}
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
