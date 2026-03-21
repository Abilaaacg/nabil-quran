import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as adhan from 'adhan'
import { useApp } from '../context/AppContext'
import './PrayerTime.css'

const PRAYER_NAMES = {
  fajr:    { ar: 'الفجر',   icon: '🌙' },
  sunrise: { ar: 'الشروق',  icon: '🌅' },
  dhuhr:   { ar: 'الظهر',   icon: '☀️' },
  asr:     { ar: 'العصر',   icon: '🌤' },
  maghrib: { ar: 'المغرب',  icon: '🌇' },
  isha:    { ar: 'العشاء',  icon: '🌙' },
}

const CALC_METHODS = [
  { id: 'MuslimWorldLeague', name: 'رابطة العالم الإسلامي' },
  { id: 'Egyptian',          name: 'الهيئة المصرية العامة للمساحة' },
  { id: 'Karachi',           name: 'جامعة العلوم الإسلامية - كراتشي' },
  { id: 'UmmAlQura',         name: 'أم القرى - مكة المكرمة' },
  { id: 'Dubai',             name: 'إدارة الشؤون الإسلامية - دبي' },
  { id: 'Qatar',             name: 'وزارة الأوقاف القطرية' },
  { id: 'Kuwait',            name: 'وزارة الأوقاف الكويتية' },
  { id: 'Singapore',         name: 'مجلس العلماء الإسلامي - سنغافورة' },
  { id: 'Turkey',            name: 'رئاسة الشؤون الدينية التركية' },
  { id: 'Tehran',            name: 'معهد الجيوفيزياء - جامعة طهران' },
  { id: 'NorthAmerica',      name: 'مجلس أمريكا الشمالية' },
]

function formatTime(date) {
  if (!date || isNaN(date)) return '--:--'
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function calcTimes(lat, lng, methodId) {
  const coords = new adhan.Coordinates(lat, lng)
  const date = new Date()
  const methodFn = adhan.CalculationMethod[methodId]
  const params = methodFn ? methodFn() : adhan.CalculationMethod.UmmAlQura()
  const pt = new adhan.PrayerTimes(coords, date, params)
  return {
    fajr:    pt.fajr,
    sunrise: pt.sunrise,
    dhuhr:   pt.dhuhr,
    asr:     pt.asr,
    maghrib: pt.maghrib,
    isha:    pt.isha,
  }
}

function getNextPrayer(times) {
  const now = new Date()
  const keys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  for (const key of keys) {
    if (times[key] > now) {
      const diff = times[key] - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      return {
        key,
        name: PRAYER_NAMES[key].ar,
        countdown: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
      }
    }
  }
  return null
}

export default function PrayerTime() {
  const { settings, updateSettings } = useApp()
  const [times, setTimes] = useState(null)
  const [next, setNext] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)
  const [now, setNow] = useState(new Date())
  const methodId = settings.calcMethod || 'UmmAlQura'

  // احسب الأوقات
  const computeTimes = useCallback((lat, lng, method) => {
    try {
      const t = calcTimes(lat, lng, method)
      setTimes(t)
      setError(null)
    } catch (e) {
      setError('تعذر حساب مواقيت الصلاة: ' + e.message)
    }
  }, [])

  // تحديد الموقع
  const detectLocation = useCallback(() => {
    setLoading(true)
    setError(null)
    setStatus('جاري تحديد الموقع...')

    const onSuccess = (lat, lng, city = '') => {
      const loc = { lat, lng, city }
      updateSettings({ location: loc })
      computeTimes(lat, lng, methodId)
      setLoading(false)
      setStatus('')
    }

    const onFail = (msg) => {
      setError(msg)
      setLoading(false)
      setStatus('')
    }

    const ipFallback = () => {
      setStatus('جاري الاستعلام عن الموقع...')
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(d => {
          if (d.latitude && d.longitude) {
            onSuccess(d.latitude, d.longitude, d.city || d.country_name || '')
          } else {
            onFail('تعذر تحديد الموقع تلقائيًا. يرجى إدخال الإحداثيات يدويًا.')
          }
        })
        .catch(() => onFail('تعذر الاتصال بخدمة تحديد الموقع'))
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => onSuccess(pos.coords.latitude, pos.coords.longitude),
        err => {
          console.warn('GPS denied:', err.message)
          ipFallback()
        },
        { timeout: 8000, maximumAge: 60000 }
      )
    } else {
      ipFallback()
    }
  }, [computeTimes, methodId, updateSettings])

  // auto-detect عند أول تحميل إذا لا يوجد موقع محفوظ
  useEffect(() => {
    if (settings.location) {
      computeTimes(settings.location.lat, settings.location.lng, methodId)
    } else {
      detectLocation()
    }
  }, [methodId]) // إعادة الحساب عند تغيير الطريقة

  // عداد تنازلي
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date()
      setNow(n)
      if (times) setNext(getNextPrayer(times))
    }, 1000)
    return () => clearInterval(t)
  }, [times])

  const todayDate = now.toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🕌 مواقيت الصلاة</h1>
        <p>{todayDate}</p>
      </div>

      {/* Errors */}
      {error && (
        <div className="prayer-error mb-4">
          ⚠️ {error}
          <button className="retry-btn" onClick={detectLocation}>إعادة المحاولة</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p>{status || 'جاري تحميل المواقيت...'}</p>
        </div>
      )}

      {/* Countdown */}
      {!loading && times && next && (
        <div className="countdown-card">
          <p>الصلاة القادمة</p>
          <strong>{PRAYER_NAMES[next.key]?.icon} {next.name}</strong>
          <div className="countdown-time">{next.countdown}</div>
        </div>
      )}

      {/* Prayer Cards */}
      {!loading && times && (
        <div className="prayers-grid">
          {Object.entries(PRAYER_NAMES).map(([key, info]) => {
            const isNext = next?.key === key
            return (
              <div key={key} className={`prayer-card ${isNext ? 'prayer-next' : ''}`}>
                {isNext && <div className="prayer-badge">التالية</div>}
                <div className="prayer-icon">{info.icon}</div>
                <div className="prayer-name">{info.ar}</div>
                <div className="prayer-time">{formatTime(times[key])}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Controls */}
      {!loading && (
        <div className="prayer-footer mt-4">
          <div className="prayer-actions">
            <button className="btn btn-secondary" onClick={detectLocation}>
              📍 تحديث الموقع
            </button>
            {settings.location?.city && (
              <span className="location-label">
                📍 {settings.location.city}
                {settings.location.lat && ` (${settings.location.lat.toFixed(2)}°, ${settings.location.lng.toFixed(2)}°)`}
              </span>
            )}
          </div>

          {/* Manual Coords */}
          <ManualLocation onSet={(lat, lng) => {
            updateSettings({ location: { lat, lng, city: 'موقع مخصص' } })
            computeTimes(lat, lng, methodId)
          }} />

          {/* Method */}
          <div className="calc-method-select mt-4">
            <label>طريقة الحساب:</label>
            <select
              value={methodId}
              onChange={e => updateSettings({ calcMethod: e.target.value })}
              className="method-select"
            >
              {CALC_METHODS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

function ManualLocation({ onSet }) {
  const [show, setShow] = useState(false)
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const submit = () => {
    const la = parseFloat(lat)
    const lo = parseFloat(lng)
    if (!isNaN(la) && !isNaN(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180) {
      onSet(la, lo)
      setShow(false)
    }
  }

  return (
    <div className="manual-location mt-4">
      <button className="btn btn-secondary" onClick={() => setShow(s => !s)}>
        🗺️ إدخال الإحداثيات يدويًا
      </button>
      {show && (
        <div className="manual-form">
          <input
            type="number"
            placeholder="خط العرض (مثال: 24.68)"
            value={lat}
            onChange={e => setLat(e.target.value)}
            className="search-input"
            style={{ marginBottom: 8 }}
          />
          <input
            type="number"
            placeholder="خط الطول (مثال: 46.72)"
            value={lng}
            onChange={e => setLng(e.target.value)}
            className="search-input"
            style={{ marginBottom: 8 }}
          />
          <button className="btn btn-primary" onClick={submit}>تأكيد</button>
        </div>
      )}
    </div>
  )
}
