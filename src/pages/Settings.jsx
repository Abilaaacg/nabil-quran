import React from 'react'
import { useApp } from '../context/AppContext'
import './Settings.css'

export default function Settings() {
  const { settings, updateSettings, theme, toggleTheme } = useApp()

  const handleReset = () => {
    if (confirm('هل تريد إعادة تعيين جميع الإعدادات؟')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>⚙️ الإعدادات</h1>
        <p>تخصيص التطبيق حسب تفضيلاتك</p>
      </div>

      {/* Theme */}
      <div className="settings-section card mb-4">
        <h2>🎨 المظهر</h2>
        <div className="setting-row">
          <div className="setting-info">
            <span>وضع العرض</span>
            <small>{theme === 'dark' ? 'وضع الليل' : 'وضع النهار'}</small>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ تفعيل النهار' : '🌙 تفعيل الليل'}
          </button>
        </div>
      </div>

      {/* Quran Settings */}
      <div className="settings-section card mb-4">
        <h2>📖 القرآن الكريم</h2>
        <div className="setting-row">
          <div className="setting-info">
            <span>حجم خط القرآن</span>
            <small>{settings.quranFontSize || 30}px</small>
          </div>
          <div className="font-size-control">
            <button
              className="size-btn"
              onClick={() => updateSettings({ quranFontSize: Math.max(20, (settings.quranFontSize || 30) - 2) })}
            >-</button>
            <span>{settings.quranFontSize || 30}</span>
            <button
              className="size-btn"
              onClick={() => updateSettings({ quranFontSize: Math.min(50, (settings.quranFontSize || 30) + 2) })}
            >+</button>
          </div>
        </div>
        <div className="quran-preview arabic-text" style={{ fontSize: `${settings.quranFontSize || 30}px` }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      </div>

      {/* Adhkar Settings */}
      <div className="settings-section card mb-4">
        <h2>📿 الأذكار</h2>
        <div className="setting-row">
          <div className="setting-info">
            <span>حجم خط الأذكار</span>
            <small>{settings.adhkarFontSize || 20}px</small>
          </div>
          <div className="font-size-control">
            <button
              className="size-btn"
              onClick={() => updateSettings({ adhkarFontSize: Math.max(14, (settings.adhkarFontSize || 20) - 2) })}
            >-</button>
            <span>{settings.adhkarFontSize || 20}</span>
            <button
              className="size-btn"
              onClick={() => updateSettings({ adhkarFontSize: Math.min(36, (settings.adhkarFontSize || 20) + 2) })}
            >+</button>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="settings-section card mb-4">
        <h2>📍 الموقع والمنطقة الزمنية</h2>
        <div className="setting-row">
          <div className="setting-info">
            <span>الموقع الحالي</span>
            <small>
              {settings.location
                ? `${settings.location.city || ''} (${settings.location.lat?.toFixed(2)}, ${settings.location.lng?.toFixed(2)})`
                : 'غير محدد'}
            </small>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                pos => updateSettings({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
                () => fetch('https://ip-api.com/json/?lang=ar')
                  .then(r => r.json())
                  .then(d => d.status === 'success' && updateSettings({ location: { lat: d.lat, lng: d.lon, city: d.city } }))
              )
            }}
          >
            📍 تحديث الموقع
          </button>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <span>المنطقة الزمنية</span>
          </div>
          <span className="setting-value">{settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
      </div>

      {/* About */}
      <div className="settings-section card mb-4">
        <h2>ℹ️ عن التطبيق</h2>
        <div className="about-info">
          <div className="about-logo">📖</div>
          <div>
            <h3>نبيل قرآن</h3>
            <p>الإصدار 1.0.0</p>
            <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              تطبيق إسلامي شامل يوفر القرآن الكريم، مواقيت الصلاة، الأذكار، وإذاعات إسلامية
            </p>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="settings-section card">
        <h2>⚠️ إعادة التعيين</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          سيؤدي ذلك إلى حذف جميع الإعدادات والعودة للوضع الافتراضي
        </p>
        <button className="btn-danger" onClick={handleReset}>
          🗑️ إعادة تعيين الإعدادات
        </button>
      </div>
    </div>
  )
}
