import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
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
import UpdateChecker from './components/UpdateChecker'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-layout">
          <UpdateChecker />
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quran" element={<Quran />} />
              <Route path="/quran/:surahNumber" element={<Surah />} />
              <Route path="/audio" element={<QuranAudio />} />
              <Route path="/prayer" element={<PrayerTime />} />
              <Route path="/adhkar" element={<Adhkar />} />
              <Route path="/adhkar/:category" element={<AdhkarCategory />} />
              <Route path="/hisnmuslim" element={<HisnMuslim />} />
              <Route path="/radio" element={<Radio />} />
              <Route path="/qibla" element={<Qibla />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
