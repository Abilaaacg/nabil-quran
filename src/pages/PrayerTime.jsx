import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as adhan from 'adhan'
import { Geolocation } from '@capacitor/geolocation'
import { useApp } from '../context/AppContext'
import './PrayerTime.css'

const isNativeApp = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

let LocalNotifications = null
if (isNativeApp()) {
  import('@capacitor/local-notifications').then(m => { LocalNotifications = m.LocalNotifications }).catch(() => {})
}

// مدن مع إحداثياتها — لا تحتاج GPS ولا API
const POPULAR_CITIES = [
  { name: 'القاهرة',          lat: 30.0444, lng: 31.2357 },
  { name: 'الإسكندرية',      lat: 31.2001, lng: 29.9187 },
  { name: 'الجيزة',           lat: 30.0131, lng: 31.2089 },
  { name: 'المنصورة',         lat: 31.0364, lng: 31.3807 },
  { name: 'طنطا',             lat: 30.7865, lng: 31.0004 },
  { name: 'الإسماعيلية',     lat: 30.5965, lng: 32.2715 },
  { name: 'السويس',           lat: 29.9668, lng: 32.5498 },
  { name: 'أسيوط',            lat: 27.1809, lng: 31.1837 },
  { name: 'سوهاج',            lat: 26.5591, lng: 31.6957 },
  { name: 'الأقصر',           lat: 25.6872, lng: 32.6396 },
  { name: 'أسوان',            lat: 24.0889, lng: 32.8998 },
  { name: 'شرم الشيخ',       lat: 27.9158, lng: 34.3300 },
  { name: 'مكة المكرمة',     lat: 21.3891, lng: 39.8579 },
  { name: 'المدينة المنورة', lat: 24.5247, lng: 39.5692 },
  { name: 'الرياض',           lat: 24.7136, lng: 46.6753 },
  { name: 'جدة',              lat: 21.5433, lng: 39.1728 },
  { name: 'الدمام',           lat: 26.4207, lng: 50.0888 },
  { name: 'دبي',              lat: 25.2048, lng: 55.2708 },
  { name: 'أبوظبي',          lat: 24.4539, lng: 54.3773 },
  { name: 'الكويت',           lat: 29.3759, lng: 47.9774 },
  { name: 'عمّان',            lat: 31.9454, lng: 35.9284 },
  { name: 'بيروت',            lat: 33.8938, lng: 35.5018 },
  { name: 'دمشق',             lat: 33.5138, lng: 36.2765 },
  { name: 'بغداد',            lat: 33.3152, lng: 44.3661 },
  { name: 'الخرطوم',          lat: 15.5007, lng: 32.5599 },
  { name: 'تونس',             lat: 36.8065, lng: 10.1815 },
  { name: 'الجزائر',          lat: 36.7538, lng: 3.0588  },
  { name: 'الدار البيضاء',   lat: 33.5731, lng: -7.5898 },
  { name: 'طرابلس',           lat: 32.9081, lng: 13.1879 },
  { name: 'لندن',             lat: 51.5074, lng: -0.1278 },
  { name: 'باريس',            lat: 48.8566, lng: 2.3522  },
]

const ADHAN_SOUNDS = [
  { id: 'makkah',  name: 'أذان الحرم المكي',   url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'madinah', name: 'أذان المسجد النبوي', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'egypt',   name: 'أذان مصري',          url: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
  { id: 'mishary', name: 'مشاري العفاسي',      url: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
  { id: 'turkish', name: 'أذان تركي',          url: 'https://www.islamcan.com/audio/adhan/azan5.mp3' },
]

const PRAYER_NAMES = {
  fajr:    { ar: 'الفجر',   icon: '🌙' },
  sunrise: { ar: 'الشروق',  icon: '🌅' },
  dhuhr:   { ar: 'الظهر',   icon: '☀️' },
  asr:     { ar: 'العصر',   icon: '🌤' },
  maghrib: { ar: 'المغرب',  icon: '🌇' },
  isha:    { ar: 'العشاء',  icon: '🌙' },
}

const CALC_METHODS = [
  { id: 'Egyptian',          name: 'الهيئة المصرية' },
  { id: 'UmmAlQura',         name: 'أم القرى' },
  { id: 'MuslimWorldLeague', name: 'رابطة العالم الإسلامي' },
  { id: 'Dubai',             name: 'دبي' },
  { id: 'Kuwait',            name: 'الكويت' },
  { id: 'Qatar',             name: 'قطر' },
  { id: 'Turkey',            name: 'تركيا' },
  { id: 'NorthAmerica',      name: 'أمريكا الشمالية' },
]

function formatTime(date) {
  if (!date || isNaN(date)) return '--:--'
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function calcTimes(lat, lng, methodId) {
  const coords = new adhan.Coordinates(lat, lng)
  const methodFn = adhan.CalculationMethod[methodId]
  const params = methodFn ? methodFn() : adhan.CalculationMethod.Egyptian()
  const pt = new adhan.PrayerTimes(coords, new Date(), params)
  return { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha }
}

function getNextPrayer(times) {
  const now = new Date()
  for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
    if (times[key] > now) {
      const diff = times[key] - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      return { key, name: PRAYER_NAMES[key].ar, countdown: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` }
    }
  }
  return null
}

export default function PrayerTime() {
  const { settings, updateSettings } = useApp()
  const [times, setTimes]             = useState(null)
  const [next, setNext]               = useState(null)
  const [now, setNow]                 = useState(new Date())
  const [adhanEnabled, setAdhanEnabled] = useState(settings.adhanEnabled ?? false)
  const [selectedAdhan, setSelectedAdhan] = useState(settings.adhanSound || 'makkah')
  const [previewing, setPreviewing]   = useState(false)
  const [showPicker, setShowPicker]   = useState(!settings.location)
  const [gpsStatus, setGpsStatus]     = useState('')   // نص حالة GPS داخل الـ picker
  const [gpsLoading, setGpsLoading]   = useState(false)
  const audioRef = useRef(null)
  const methodId = settings.calcMethod || 'Egyptian'

  // ─── جدولة إشعارات 5 دقائق قبل الأذان ───────────────────────────────
  const schedulePreAdhanNotifs = useCallback(async (prayerTimes, enabled) => {
    if (!isNativeApp() || !LocalNotifications) return
    try {
      await LocalNotifications.cancel({ notifications: [1,2,3,4,5].map(id => ({ id })) }).catch(() => {})
      if (!enabled) return
      await LocalNotifications.requestPermissions()
      await LocalNotifications.createChannel({ id: 'prayer-notifs', name: 'تنبيهات الصلاة', importance: 5, sound: 'default', vibration: true }).catch(() => {})
      const now = new Date()
      const pending = ['fajr','dhuhr','asr','maghrib','isha']
        .map((key, idx) => {
          const pt = prayerTimes[key]
          if (!pt) return null
          const notifTime = new Date(pt.getTime() - 5 * 60 * 1000)
          if (notifTime <= now) return null
          return { id: idx + 1, title: `🕌 ${PRAYER_NAMES[key].ar} بعد 5 دقائق`, body: `استعد لصلاة ${PRAYER_NAMES[key].ar}`, schedule: { at: notifTime, allowWhileIdle: true }, channelId: 'prayer-notifs', smallIcon: 'ic_notification' }
        }).filter(Boolean)
      if (pending.length) await LocalNotifications.schedule({ notifications: pending })
    } catch (e) { console.warn('Prayer notif:', e) }
  }, [])

  useEffect(() => { if (times) schedulePreAdhanNotifs(times, adhanEnabled) }, [times, adhanEnabled, schedulePreAdhanNotifs])

  // ─── حساب الأوقات عند تغيير الطريقة أو الموقع ───────────────────────
  useEffect(() => {
    if (settings.location) {
      try {
        setTimes(calcTimes(settings.location.lat, settings.location.lng, methodId))
      } catch (_) {}
    }
  }, [methodId, settings.location?.lat, settings.location?.lng])

  // ─── عداد تنازلي + أذان ──────────────────────────────────────────────
  useEffect(() => {
    let lastDate = new Date().toDateString()
    const t = setInterval(() => {
      const n = new Date()
      setNow(n)
      const today = n.toDateString()
      if (today !== lastDate && settings.location) {
        lastDate = today
        try { setTimes(calcTimes(settings.location.lat, settings.location.lng, methodId)) } catch (_) {}
        return
      }
      if (times) {
        setNext(getNextPrayer(times))
        if (adhanEnabled) {
          const prayers = ['fajr','dhuhr','asr','maghrib','isha']
          prayers.forEach(key => {
            const pt = times[key]
            if (!pt) return
            const diff = n - pt
            const playKey = `adhan_played_${today}_${key}`
            if (diff >= 0 && diff < 30000 && !localStorage.getItem(playKey)) {
              localStorage.setItem(playKey, '1')
              const sound = ADHAN_SOUNDS.find(s => s.id === selectedAdhan) || ADHAN_SOUNDS[0]
              if (audioRef.current) audioRef.current.pause()
              audioRef.current = new Audio(sound.url)
              audioRef.current.play().catch(() => {})
            }
          })
        }
      }
    }, 1000)
    return () => clearInterval(t)
  }, [times, adhanEnabled, selectedAdhan, methodId, settings.location])

  // ─── اختيار موقع (مدينة أو GPS) ─────────────────────────────────────
  const pickLocation = (lat, lng, city) => {
    updateSettings({ location: { lat, lng, city } })
    try { setTimes(calcTimes(lat, lng, methodId)) } catch (_) {}
    setShowPicker(false)
    setGpsStatus('')
    setGpsLoading(false)
  }

  // GPS
  const doGps = async () => {
    setGpsLoading(true)
    setGpsStatus('جاري طلب الصلاحية...')
    try {
      if (isNativeApp()) {
        const perm = await Geolocation.requestPermissions()
        if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
          setGpsStatus('❌ مرفوض — اذهب لإعدادات الهاتف وفعّل الموقع للتطبيق')
          setGpsLoading(false)
          return
        }
        setGpsStatus('جاري تحديد موقعك...')
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000 })
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords
        setGpsStatus(`✓ تم — دقة ${Math.round(acc)} م`)
        // جلب اسم المدينة
        let city = ''
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`)
          const d = await r.json()
          city = d.address?.city || d.address?.town || d.address?.village || d.address?.suburb || ''
        } catch (_) {}
        pickLocation(lat, lng, city || 'موقعي الحالي')
      } else {
        setGpsStatus('جاري تحديد موقعك...')
        navigator.geolocation.getCurrentPosition(
          async pos => {
            const { latitude: lat, longitude: lng } = pos.coords
            let city = ''
            try {
              const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`)
              const d = await r.json()
              city = d.address?.city || d.address?.town || d.address?.village || ''
            } catch (_) {}
            pickLocation(lat, lng, city || 'موقعي الحالي')
          },
          () => { setGpsStatus('❌ تعذر الحصول على الموقع — اختر مدينتك من القائمة'); setGpsLoading(false) },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        )
      }
    } catch (e) {
      setGpsStatus('❌ تعذر الحصول على الموقع — اختر مدينتك من القائمة')
      setGpsLoading(false)
    }
  }

  const toggleAdhan = () => {
    const val = !adhanEnabled
    setAdhanEnabled(val)
    updateSettings({ adhanEnabled: val })
  }

  const previewAdhan = () => {
    if (previewing) { audioRef.current?.pause(); setPreviewing(false); return }
    const sound = ADHAN_SOUNDS.find(s => s.id === selectedAdhan) || ADHAN_SOUNDS[0]
    if (audioRef.current) audioRef.current.pause()
    audioRef.current = new Audio(sound.url)
    audioRef.current.play().catch(() => {})
    audioRef.current.onended = () => setPreviewing(false)
    setPreviewing(true)
  }

  const todayDate = now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🕌 مواقيت الصلاة</h1>
        <p>{todayDate}</p>
      </div>

      {/* ── شريط الموقع ── */}
      <button className="location-bar" onClick={() => { setShowPicker(p => !p); setGpsStatus('') }}>
        <span className="location-bar-icon">📍</span>
        <span className="location-bar-city">
          {settings.location?.city || 'اختر مدينتك'}
        </span>
        <span className="location-bar-arrow">{showPicker ? '▲' : '▼'}</span>
      </button>

      {/* ── منتقي الموقع (مثل أنا مسلم) ── */}
      {showPicker && (
        <div className="city-picker">
          {/* GPS */}
          <button className="gps-btn" onClick={doGps} disabled={gpsLoading}>
            {gpsLoading ? '⏳' : '📡'} تحديد موقعي تلقائياً
          </button>
          {gpsStatus && <div className="gps-status">{gpsStatus}</div>}

          {/* بحث */}
          <CitySearch onPick={pickLocation} />

          {/* مدن سريعة */}
          <div className="quick-cities-title">مدن سريعة</div>
          <div className="quick-cities">
            {POPULAR_CITIES.map(c => (
              <button
                key={c.name}
                className={`quick-city ${settings.location?.city === c.name ? 'active' : ''}`}
                onClick={() => pickLocation(c.lat, c.lng, c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── العداد التنازلي ── */}
      {times && next && (
        <div className="countdown-card">
          <p>الصلاة القادمة</p>
          <strong>{PRAYER_NAMES[next.key]?.icon} {next.name}</strong>
          <div className="countdown-time">{next.countdown}</div>
        </div>
      )}

      {/* ── لم يتم اختيار موقع ── */}
      {!times && !showPicker && (
        <div className="prayer-no-location">
          <div style={{ fontSize: 48 }}>📍</div>
          <p>اختر مدينتك لعرض مواقيت الصلاة</p>
          <button className="btn btn-primary" onClick={() => setShowPicker(true)}>اختر المدينة</button>
        </div>
      )}

      {/* ── بطاقات الصلوات ── */}
      {times && (
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

      {/* ── إعدادات ── */}
      <div className="prayer-footer mt-4">
        {/* طريقة الحساب */}
        <div className="calc-method-select mt-4">
          <label>طريقة الحساب:</label>
          <select value={methodId} onChange={e => updateSettings({ calcMethod: e.target.value })} className="method-select">
            {CALC_METHODS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        {/* الأذان */}
        <div className="adhan-section mt-4">
          <div className="adhan-header">
            <span className="adhan-label">🔔 الأذان التلقائي</span>
            <button className={`adhan-toggle ${adhanEnabled ? 'on' : 'off'}`} onClick={toggleAdhan}>
              {adhanEnabled ? 'مفعّل' : 'معطّل'}
            </button>
          </div>
          {adhanEnabled && (
            <div className="adhan-picker">
              <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>اختر صوت المؤذن:</label>
              <div className="adhan-list">
                {ADHAN_SOUNDS.map(s => (
                  <button key={s.id} className={`adhan-item ${selectedAdhan === s.id ? 'active' : ''}`} onClick={() => { setSelectedAdhan(s.id); updateSettings({ adhanSound: s.id }) }}>
                    {s.name}
                  </button>
                ))}
              </div>
              <button className="adhan-preview" onClick={previewAdhan}>
                {previewing ? '⏹ إيقاف' : '▶ معاينة الأذان'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── مكوّن البحث عن مدينة ────────────────────────────────────────────────
function CitySearch({ onPick }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy]       = useState(false)
  const timer = useRef(null)

  const search = q => {
    setResults([])
    if (q.length < 2) return
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setBusy(true)
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=7&accept-language=ar`)
        setResults(await r.json())
      } catch (_) {}
      setBusy(false)
    }, 500)
  }

  return (
    <div className="city-search-wrap">
      <input
        className="search-input"
        placeholder="🔍 ابحث عن مدينة أخرى..."
        value={query}
        onChange={e => { setQuery(e.target.value); search(e.target.value) }}
      />
      {busy && <div className="gps-status">جاري البحث...</div>}
      {results.length > 0 && (
        <div className="city-results">
          {results.map((r, i) => (
            <button key={i} className="city-result-item" onClick={() => {
              const name = r.display_name.split(',')[0].trim()
              onPick(parseFloat(r.lat), parseFloat(r.lon), name)
              setQuery(name)
              setResults([])
            }}>
              📍 {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
