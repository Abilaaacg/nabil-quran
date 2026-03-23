import React, { useRef, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import ChatFAB from './components/ChatFAB'
import Home from './pages/Home'
import Quran from './pages/Quran'
import Surah from './pages/Surah'
import QuranAudio from './pages/QuranAudio'
import PrayerTime from './pages/PrayerTime'
import Adhkar from './pages/Adhkar'
import AdhkarCategory from './pages/AdhkarCategory'
import HisnMuslim from './pages/HisnMuslim'
import Radio from './pages/Radio'
import Settings from './pages/Settings'
import Qibla from './pages/Qibla'
import SunnahPage from './pages/SunnahPage'
import DailyChallenge from './pages/DailyChallenge'
import Tasbeeh from './pages/Tasbeeh'
import NamesOfAllah from './pages/NamesOfAllah'
import Zakat from './pages/Zakat'
import IslamicAI from './pages/IslamicAI'
import UpdateChecker from './components/UpdateChecker'
import WhatsNew from './components/WhatsNew'
import WelcomeAudio from './components/WelcomeAudio'
import TopBar from './components/TopBar'
import { initNotifications } from './services/notifications'
import * as adhan from 'adhan'

const ADHAN_URLS = {
  makkah:  'https://www.islamcan.com/audio/adhan/azan1.mp3',
  madinah: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
  egypt:   'https://www.islamcan.com/audio/adhan/azan3.mp3',
  mishary: 'https://www.islamcan.com/audio/adhan/azan4.mp3',
  turkish: 'https://www.islamcan.com/audio/adhan/azan5.mp3',
}

// ترتيب التابات للسويب
const TAB_ROUTES = ['/', '/quran', '/prayer', '/adhkar', '/settings']

function AppLayout() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { settings } = useApp()
  const touchX    = useRef(null)
  const touchY    = useRef(null)
  const adhanAudioRef = useRef(null)
  const timersRef = useRef([])

  // جدولة الإشعارات
  useEffect(() => {
    initNotifications(settings)
  }, [settings.adhanEnabled, settings.salawatEnabled, settings.salawatInterval, settings.notifMinutesBefore, settings.location?.lat])

  // ─── الأذان الصوتي — setTimeout دقيق لكل صلاة (مثل أنا مسلم) ──
  useEffect(() => {
    // مسح أي timers قديمة
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []

    if (!settings.adhanEnabled || !settings.location) return

    const now = new Date()
    const coords = new adhan.Coordinates(settings.location.lat, settings.location.lng)
    const methodFn = adhan.CalculationMethod[settings.calcMethod || 'Egyptian']
    const params = methodFn ? methodFn() : adhan.CalculationMethod.Egyptian()
    const pt = new adhan.PrayerTimes(coords, now, params)
    const today = now.toDateString()
    const soundUrl = ADHAN_URLS[settings.adhanSound || 'makkah'] || ADHAN_URLS.makkah

    const playAdhan = (key) => {
      const playKey = `adhan_played_${today}_${key}`
      if (localStorage.getItem(playKey)) return
      localStorage.setItem(playKey, '1')
      if (adhanAudioRef.current) { adhanAudioRef.current.pause(); adhanAudioRef.current = null }
      const audio = new Audio(soundUrl)
      audio.volume = 1.0
      audio.play().catch(() => {})
      adhanAudioRef.current = audio
    }

    // جدول setTimeout لكل صلاة لسه مجاتش
    for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      const pTime = pt[key]
      if (!pTime) continue
      const ms = pTime.getTime() - now.getTime()
      if (ms > 0 && ms < 24 * 3600000) {
        const t = setTimeout(() => playAdhan(key), ms)
        timersRef.current.push(t)
      } else if (ms >= -30000 && ms <= 0) {
        // الصلاة دلوقتي (خلال آخر 30 ثانية)
        playAdhan(key)
      }
    }

    // لما المستخدم يرجع للتطبيق بعد ما كان في الخلفية
    const onResume = () => {
      const n = new Date()
      const pt2 = new adhan.PrayerTimes(coords, n, params)
      for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
        const t = pt2[key]
        if (!t) continue
        const diff = n - t
        const pk = `adhan_played_${n.toDateString()}_${key}`
        if (diff >= 0 && diff < 120000 && !localStorage.getItem(pk)) {
          playAdhan(key)
          break
        }
      }
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) onResume() })
    document.addEventListener('resume', onResume) // Capacitor resume

    return () => {
      timersRef.current.forEach(t => clearTimeout(t))
      timersRef.current = []
    }
  }, [settings.adhanEnabled, settings.adhanSound, settings.location?.lat, settings.location?.lng, settings.calcMethod])

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
    touchY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    const dy = e.changedTouches[0].clientY - touchY.current
    touchX.current = null
    // تجاهل السحب العمودي أو القصير
    if (Math.abs(dx) < 65 || Math.abs(dy) > Math.abs(dx) * 0.9) return
    const i = TAB_ROUTES.indexOf(location.pathname)
    if (i === -1) return
    // سحب يمين = الصفحة السابقة — سحب يسار = التالية
    if (dx > 0 && i > 0)                      navigate(TAB_ROUTES[i - 1])
    else if (dx < 0 && i < TAB_ROUTES.length - 1) navigate(TAB_ROUTES[i + 1])
  }

  return (
    <div
      className="app-layout"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <TopBar />
      <WhatsNew />
      <UpdateChecker />
      <WelcomeAudio />
      <Sidebar />
      <main className="main-content">
        <div key={location.key} className="page-transition">
          <Routes>
            <Route path="/"                    element={<Home />} />
            <Route path="/quran"               element={<Quran />} />
            <Route path="/quran/:surahNumber"  element={<Surah />} />
            <Route path="/audio"               element={<QuranAudio />} />
            <Route path="/prayer"              element={<PrayerTime />} />
            <Route path="/adhkar"              element={<Adhkar />} />
            <Route path="/adhkar/:category"    element={<AdhkarCategory />} />
            <Route path="/hisnmuslim"          element={<HisnMuslim />} />
            <Route path="/radio"               element={<Radio />} />
            <Route path="/qibla"               element={<Qibla />} />
            <Route path="/sunnah"              element={<SunnahPage />} />
            <Route path="/challenge"           element={<DailyChallenge />} />
            <Route path="/tasbeeh"             element={<Tasbeeh />} />
            <Route path="/names"               element={<NamesOfAllah />} />
            <Route path="/zakat"               element={<Zakat />} />
            <Route path="/ai"                  element={<IslamicAI />} />
            <Route path="/settings"            element={<Settings />} />
          </Routes>
        </div>
      </main>
      <MobileNav />
      <ChatFAB />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  )
}
