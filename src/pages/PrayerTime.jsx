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

const ADHAN_SOUNDS = [
  { id: 'makkah',  name: 'أذان الحرم المكي',      url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'madinah', name: 'أذان المسجد النبوي',     url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'egypt',   name: 'أذان مصري',              url: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
  { id: 'mishary', name: 'مشاري العفاسي',           url: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
  { id: 'turkish', name: 'أذان تركي',              url: 'https://www.islamcan.com/audio/adhan/azan5.mp3' },
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
  const [adhanEnabled, setAdhanEnabled] = useState(settings.adhanEnabled ?? false)
  const [selectedAdhan, setSelectedAdhan] = useState(settings.adhanSound || 'makkah')
  const [previewing, setPreviewing] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [locUpdated, setLocUpdated] = useState(false)
  const audioRef = useRef(null)
  const methodId = settings.calcMethod || 'UmmAlQura'

  // جدولة إشعارات 5 دقائق قبل الأذان
  const schedulePreAdhanNotifs = useCallback(async (prayerTimes, enabled) => {
    if (!isNativeApp() || !LocalNotifications) return
    try {
      await LocalNotifications.cancel({ notifications: [1,2,3,4,5].map(id => ({ id })) }).catch(() => {})
      if (!enabled) return
      await LocalNotifications.requestPermissions()
      await LocalNotifications.createChannel({
        id: 'prayer-notifs',
        name: 'تنبيهات الصلاة',
        importance: 5,
        sound: 'default',
        vibration: true,
      }).catch(() => {})
      const now = new Date()
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
      const pending = prayers
        .map((key, idx) => {
          const pt = prayerTimes[key]
          if (!pt) return null
          const notifTime = new Date(pt.getTime() - 5 * 60 * 1000)
          if (notifTime <= now) return null
          return {
            id: idx + 1,
            title: `🕌 ${PRAYER_NAMES[key].ar} بعد 5 دقائق`,
            body: `استعد لصلاة ${PRAYER_NAMES[key].ar}`,
            schedule: { at: notifTime, allowWhileIdle: true },
            channelId: 'prayer-notifs',
            smallIcon: 'ic_notification',
          }
        })
        .filter(Boolean)
      if (pending.length > 0) await LocalNotifications.schedule({ notifications: pending })
    } catch (e) {
      console.warn('Prayer notification scheduling failed:', e)
    }
  }, [])

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

  // إعادة جدولة إشعارات الصلاة عند تغيير الأوقات أو حالة الأذان
  useEffect(() => {
    if (times) schedulePreAdhanNotifs(times, adhanEnabled)
  }, [times, adhanEnabled, schedulePreAdhanNotifs])

  // جلب اسم المدينة من الإحداثيات
  const reverseGeocode = async (lat, lng) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
        { headers: { 'Accept-Language': 'ar' } }
      )
      const d = await r.json()
      return d.address?.city || d.address?.town || d.address?.village || d.address?.county || ''
    } catch (_) { return '' }
  }

  // تحديد الموقع
  const detectLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    setShowSearch(false)
    setStatus('جاري طلب صلاحية الموقع...')

    const applyCoords = async (lat, lng, acc) => {
      setStatus(`تم التحديد ✓ دقة ${Math.round(acc)} م — جاري الحصول على اسم المدينة...`)
      const city = await reverseGeocode(lat, lng)
      updateSettings({ location: { lat, lng, city } })
      try {
        const t = calcTimes(lat, lng, methodId)
        setTimes(t)
        setError(null)
      } catch (e) { setError('تعذر حساب المواقيت') }
      setLocUpdated(true)
      setTimeout(() => setLocUpdated(false), 4000)
      setLoading(false)
      setStatus('')
    }

    try {
      if (isNativeApp()) {
        // ← الطريقة الصحيحة على Android
        const perm = await Geolocation.requestPermissions()
        if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
          setError('الرجاء السماح للتطبيق بالوصول إلى الموقع من إعدادات الهاتف ثم حاول مجدداً')
          setLoading(false)
          setStatus('')
          return
        }
        setStatus('جاري تحديد الموقع...')
        // جمع عدة قراءات وأخذ أدقها
        let best = null
        const tryRead = async () => {
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
          if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos
        }
        await tryRead().catch(() => {})
        // قراءة ثانية بعد ثانية للتحسين
        await new Promise(r => setTimeout(r, 1200))
        await tryRead().catch(() => {})
        if (!best) throw new Error('no position')
        await applyCoords(best.coords.latitude, best.coords.longitude, best.coords.accuracy)
      } else {
        // ← الويب: watchPosition
        if (!navigator.geolocation) throw new Error('unsupported')
        setStatus('جاري تحديد الموقع...')
        let bestAcc = Infinity, bestPos = null, done = false, watchId = null
        const finish = () => {
          if (done) return
          done = true
          navigator.geolocation.clearWatch(watchId)
          if (bestPos) applyCoords(bestPos.coords.latitude, bestPos.coords.longitude, bestPos.coords.accuracy)
          else { setError('تعذر تحديد الموقع — ابحث عن مدينتك'); setLoading(false); setStatus('') }
        }
        const tid = setTimeout(finish, 15000)
        watchId = navigator.geolocation.watchPosition(
          pos => {
            const acc = pos.coords.accuracy
            setStatus(`دقة: ${Math.round(acc)} م`)
            if (acc < bestAcc) { bestAcc = acc; bestPos = pos }
            if (acc < 80) { clearTimeout(tid); finish() }
          },
          () => { clearTimeout(tid); done = true; navigator.geolocation.clearWatch(watchId)
            setError('تعذر تحديد الموقع — ابحث عن مدينتك'); setLoading(false); setStatus('') },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        )
      }
    } catch (e) {
      setError('تعذر تحديد الموقع — ابحث عن مدينتك من زرار 🔍')
      setLoading(false)
      setStatus('')
    }
  }, [methodId, updateSettings])

  // auto-detect عند أول تحميل إذا لا يوجد موقع محفوظ
  useEffect(() => {
    if (settings.location) {
      computeTimes(settings.location.lat, settings.location.lng, methodId)
    } else {
      detectLocation()
    }
  }, [methodId]) // إعادة الحساب عند تغيير الطريقة

  // عداد تنازلي + أذان
  useEffect(() => {
    let lastDate = new Date().toDateString()

    const t = setInterval(() => {
      const n = new Date()
      setNow(n)

      // إعادة حساب المواقيت عند منتصف الليل
      const today = n.toDateString()
      if (today !== lastDate && settings.location) {
        lastDate = today
        computeTimes(settings.location.lat, settings.location.lng, methodId)
        return
      }

      if (times) {
        setNext(getNextPrayer(times))

        // تشغيل الأذان عند وقت الصلاة
        if (adhanEnabled) {
          const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
          prayers.forEach(key => {
            const pt = times[key]
            if (!pt) return
            const diff = n - pt  // موجب = بعد وقت الصلاة، سالب = قبله
            const playKey = `adhan_played_${today}_${key}`
            // شغّل الأذان خلال أول 30 ثانية من وقت الصلاة فقط
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
  }, [times, adhanEnabled, selectedAdhan, computeTimes, methodId, settings.location])

  const applyLocation = (lat, lng, city) => {
    updateSettings({ location: { lat, lng, city } })
    setTimes(null)
    try {
      const t = calcTimes(lat, lng, methodId)
      setTimes(t)
      setError(null)
    } catch (e) {
      setError('تعذر حساب المواقيت')
    }
    setShowSearch(false)
    setLocUpdated(true)
    setTimeout(() => setLocUpdated(false), 3000)
  }

  const toggleAdhan = () => {
    const val = !adhanEnabled
    setAdhanEnabled(val)
    updateSettings({ adhanEnabled: val })
  }

  const changeAdhan = (id) => {
    setSelectedAdhan(id)
    updateSettings({ adhanSound: id })
  }

  const previewAdhan = () => {
    if (previewing) {
      audioRef.current?.pause()
      setPreviewing(false)
      return
    }
    const sound = ADHAN_SOUNDS.find(s => s.id === selectedAdhan) || ADHAN_SOUNDS[0]
    if (audioRef.current) audioRef.current.pause()
    audioRef.current = new Audio(sound.url)
    audioRef.current.play().catch(() => {})
    audioRef.current.onended = () => setPreviewing(false)
    setPreviewing(true)
  }

  const todayDate = now.toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🕌 مواقيت الصلاة</h1>
        <p>{todayDate}</p>
      </div>

      {/* شريط الموقع — دايماً أعلى الصفحة */}
      <div className="location-bar">
        <div className="location-bar-info">
          <span className="location-bar-icon">📍</span>
          <span className="location-bar-city">
            {loading ? status : (settings.location?.city || 'لم يتم تحديد الموقع')}
          </span>
          {locUpdated && <span className="location-updated">✓ تم التحديث</span>}
        </div>
        <div className="location-bar-btns">
          <button
            className={`loc-btn ${loading ? 'loc-btn-loading' : ''}`}
            onClick={detectLocation}
            disabled={loading}
            title="تحديد موقعي بدقة"
          >
            {loading ? '⏳' : '📡'} GPS
          </button>
          <button
            className={`loc-btn ${showSearch ? 'loc-btn-active' : ''}`}
            onClick={() => setShowSearch(s => !s)}
          >
            🔍 مدينة
          </button>
        </div>
      </div>

      {/* بحث المدينة */}
      {showSearch && (
        <CitySearch onSet={applyLocation} />
      )}

      {/* خطأ */}
      {error && !loading && (
        <div className="prayer-error mb-4">
          ⚠️ {error}
          <button className="retry-btn" onClick={detectLocation}>إعادة المحاولة</button>
        </div>
      )}

      {/* تحميل */}
      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p>{status || 'جاري تحميل المواقيت...'}</p>
        </div>
      )}

      {/* العداد التنازلي */}
      {!loading && times && next && (
        <div className="countdown-card">
          <p>الصلاة القادمة</p>
          <strong>{PRAYER_NAMES[next.key]?.icon} {next.name}</strong>
          <div className="countdown-time">{next.countdown}</div>
        </div>
      )}

      {/* بطاقات الصلوات */}
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

      {/* إعدادات */}
      {!loading && (
        <div className="prayer-footer mt-4">
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

          {/* الأذان */}
          <div className="adhan-section mt-4">
            <div className="adhan-header">
              <span className="adhan-label">🔔 الأذان التلقائي</span>
              <button
                className={`adhan-toggle ${adhanEnabled ? 'on' : 'off'}`}
                onClick={toggleAdhan}
              >
                {adhanEnabled ? 'مفعّل' : 'معطّل'}
              </button>
            </div>

            {adhanEnabled && (
              <div className="adhan-picker">
                <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                  اختر صوت المؤذن:
                </label>
                <div className="adhan-list">
                  {ADHAN_SOUNDS.map(s => (
                    <button
                      key={s.id}
                      className={`adhan-item ${selectedAdhan === s.id ? 'active' : ''}`}
                      onClick={() => changeAdhan(s.id)}
                    >
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
      )}
    </div>
  )
}

function CitySearch({ onSet }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  const search = (q) => {
    setResults([])
    if (!q.trim() || q.length < 2) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=7&accept-language=ar`
        )
        const d = await r.json()
        setResults(d)
      } catch (_) {}
      setSearching(false)
    }, 500)
  }

  const pick = (item) => {
    const name = item.display_name.split(',')[0].trim()
    onSet(parseFloat(item.lat), parseFloat(item.lon), name)
    setQuery(name)
    setResults([])
  }

  return (
    <div className="city-search mt-4">
      <label className="city-search-label">🔍 ابحث عن مدينتك</label>
      <div className="city-search-wrap">
        <input
          className="search-input"
          placeholder="اكتب اسم المدينة... مثال: القاهرة"
          value={query}
          onChange={e => { setQuery(e.target.value); search(e.target.value) }}
          style={{ marginTop: 8 }}
        />
        {searching && (
          <div className="city-searching">جاري البحث...</div>
        )}
        {results.length > 0 && (
          <div className="city-results">
            {results.map((r, i) => (
              <button key={i} className="city-result-item" onClick={() => pick(r)}>
                📍 {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
