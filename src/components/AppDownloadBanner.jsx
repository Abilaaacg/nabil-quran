import { useState, useEffect } from 'react'
import './AppDownloadBanner.css'

const isNativeApp = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

export default function AppDownloadBanner() {
  const [release, setRelease] = useState(null)
  const [step, setStep] = useState('idle') // idle | downloading | done

  useEffect(() => {
    if (isNativeApp()) return
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
    setStep('downloading')
    const a = document.createElement('a')
    a.href = release.url
    a.download = 'nabil-quran.apk'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setStep('done'), 2000)
  }

  // بعد التحميل — تعليمات التثبيت
  if (step === 'done') {
    return (
      <div className="apk-banner apk-banner-done">
        <div className="apk-banner-glow" />
        <div className="done-header">
          <span className="done-icon">✅</span>
          <div>
            <div className="done-title">تم بدء التحميل!</div>
            <div className="done-sub">اتبع الخطوات لتثبيت التحديث</div>
          </div>
        </div>

        <div className="install-steps">
          <div className="install-step">
            <span className="step-num">١</span>
            <span>افتح ملف <strong>nabil-quran.apk</strong> من التنزيلات</span>
          </div>
          <div className="install-step">
            <span className="step-num">٢</span>
            <span>اضغط <strong>تثبيت</strong> — لو ظهر "تعارض" أو "خطأ في التثبيت":</span>
          </div>
          <div className="install-step conflict-hint">
            <span className="step-num">!</span>
            <span>اذهب لإعدادات الهاتف ← التطبيقات ← نور الإسلام ← <strong>إزالة التثبيت</strong>، ثم ثبّت الملف مجدداً</span>
          </div>
        </div>

        <button className="done-dismiss" onClick={() => setStep('idle')}>
          حسناً، فهمت
        </button>
      </div>
    )
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
          className={`apk-download-btn ${step === 'downloading' ? 'downloading' : ''}`}
          onClick={handleDownload}
          disabled={step === 'downloading'}
        >
          {step === 'downloading' ? (
            <><span className="apk-spinner" /> جاري التحميل</>
          ) : (
            <><span className="apk-download-icon">⬇</span> تحميل التطبيق</>
          )}
        </button>
      </div>

      <div className="apk-features">
        <span>📖 القرآن كاملاً</span>
        <span>🕌 مواقيت الصلاة</span>
        <span>🧭 القبلة</span>
        <span>📿 الأذكار</span>
        <span>📻 الإذاعة</span>
      </div>
    </div>
  )
}
