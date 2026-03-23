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

const ADHAN_SOUNDS = [
  { id: 'makkah',  url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'madinah', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'egypt',   url: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
  { id: 'mishary', url: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
  { id: 'turkish', url: 'https://www.islamcan.com/audio/adhan/azan5.mp3' },
]

// ترتيب التابات للسويب
const TAB_ROUTES = ['/', '/quran', '/prayer', '/adhkar', '/settings']

function AppLayout() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { settings } = useApp()
  const touchX    = useRef(null)
  const touchY    = useRef(null)
  const adhanAudioRef = useRef(null)

  // جدولة الإشعارات عند فتح التطبيق وعند تغيير الإعدادات
  useEffect(() => {
    initNotifications(settings)
  }, [settings.adhanEnabled, settings.salawatEnabled, settings.salawatInterval, settings.notifMinutesBefore, settings.location?.lat])

  // ─── تشغيل صوت الأذان عند وقت الصلاة (يعمل من أي صفحة) ──────
  useEffect(() => {
    if (!settings.adhanEnabled || !settings.location) return
    const check = setInterval(() => {
      try {
        const now = new Date()
        const coords = new adhan.Coordinates(settings.location.lat, settings.location.lng)
        const methodFn = adhan.CalculationMethod[settings.calcMethod || 'Egyptian']
        const params = methodFn ? methodFn() : adhan.CalculationMethod.Egyptian()
        const pt = new adhan.PrayerTimes(coords, now, params)
        const today = now.toDateString()

        for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
          const pTime = pt[key]
          if (!pTime) continue
          const diff = now - pTime
          const playKey = `adhan_played_${today}_${key}`
          if (diff >= 0 && diff < 30000 && !localStorage.getItem(playKey)) {
            localStorage.setItem(playKey, '1')
            const sound = ADHAN_SOUNDS.find(s => s.id === (settings.adhanSound || 'makkah')) || ADHAN_SOUNDS[0]
            if (adhanAudioRef.current) adhanAudioRef.current.pause()
            adhanAudioRef.current = new Audio(sound.url)
            adhanAudioRef.current.play().catch(() => {})
            break
          }
        }
      } catch {}
    }, 1000)
    return () => clearInterval(check)
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
