import React, { useState, useRef, useEffect } from 'react'
import './Radio.css'

const stations = [
  {
    name: 'إذاعة القرآن الكريم - تراتيل',
    url: 'https://Qurango.net/radio/tarateel',
    flag: '🇸🇦',
    desc: 'بث مباشر - تراتيل',
  },
  {
    name: 'إذاعة القرآن المرتل',
    url: 'https://Qurango.net/radio/murattal',
    flag: '🌍',
    desc: 'بث مباشر - مرتل',
  },
  {
    name: 'إذاعة القرآن الكريم - مصر',
    url: 'https://media.egyptradio.eg/EgyptRadio/QURAAN.aac',
    flag: '🇪🇬',
    desc: 'القرآن الكريم من القاهرة',
  },
  {
    name: 'إذاعة القرآن - السعودية',
    url: 'https://stream.radiojar.com/0tpy1h0kxtzuv',
    flag: '🇸🇦',
    desc: 'إذاعة القرآن الكريم السعودية',
  },
  {
    name: 'Qatar Quran Radio',
    url: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
    flag: '🇶🇦',
    desc: 'إذاعة قرآن كريم قطر',
  },
  {
    name: 'Radio Islam',
    url: 'https://radioislam.net:8000/radioislam',
    flag: '🌍',
    desc: 'راديو إسلام',
  },
]

export default function Radio() {
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [volume, setVolume] = useState(80)
  const audioRef = useRef(null)
  const timeoutRef = useRef(null)

  // تنظيف الـ timeout عند الخروج
  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const startTimeout = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (!playing) {
        setLoading(false)
        setError(true)
        audioRef.current?.pause()
      }
    }, 12000) // 12 ثانية انتظار ثم خطأ
  }

  const playStation = (station) => {
    if (current?.name === station.name && playing) {
      audioRef.current?.pause()
      setPlaying(false)
      clearTimeout(timeoutRef.current)
      return
    }
    setCurrent(station)
    setLoading(true)
    setPlaying(false)
    setError(false)
    clearTimeout(timeoutRef.current)

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume / 100
        audioRef.current.load()
        audioRef.current.play().catch(() => {
          setLoading(false)
          setError(true)
        })
        startTimeout()
      }
    }, 100)
  }

  const retry = () => {
    if (current) {
      setError(false)
      setLoading(true)
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load()
          audioRef.current.play().catch(() => {
            setLoading(false)
            setError(true)
          })
          startTimeout()
        }
      }, 100)
    }
  }

  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v / 100
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>📻 الإذاعة</h1>
        <p>إذاعات القرآن الكريم والراديو الإسلامي</p>
      </div>

      {current && (
        <div className="radio-player card mb-4">
          <div className="radio-player-info">
            <div className="radio-flag">{current.flag}</div>
            <div>
              <div className="radio-name">{current.name}</div>
              <div className="radio-desc">{current.desc}</div>
            </div>
          </div>
          <div className="radio-controls">
            <div className="live-indicator">
              {error ? (
                <>
                  <span style={{ color: 'var(--danger)', fontSize: 13 }}>⚠️ البث غير متاح حالياً</span>
                  <button onClick={retry} className="retry-btn">إعادة المحاولة</button>
                </>
              ) : (
                <>
                  <span className={`live-dot ${playing ? 'active' : ''}`}></span>
                  {loading ? 'جاري التحميل...' : playing ? '🔴 بث مباشر' : 'متوقف'}
                </>
              )}
            </div>
            <div className="volume-control">
              <span>🔊</span>
              <input
                type="range" min="0" max="100" value={volume}
                onChange={handleVolumeChange} className="volume-slider"
              />
              <span>{volume}%</span>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={current.url}
            onPlaying={() => { setPlaying(true); setLoading(false); setError(false); clearTimeout(timeoutRef.current) }}
            onPause={() => { setPlaying(false); clearTimeout(timeoutRef.current) }}
            onWaiting={() => setLoading(true)}
            onError={() => { setLoading(false); setPlaying(false); setError(true); clearTimeout(timeoutRef.current) }}
          />
        </div>
      )}

      <div className="stations-list">
        {stations.map((station, i) => (
          <button
            key={i}
            className={`station-item ${current?.name === station.name ? 'active' : ''}`}
            onClick={() => playStation(station)}
          >
            <div className="station-flag">{station.flag}</div>
            <div className="station-info">
              <div className="station-name">{station.name}</div>
              <div className="station-desc">{station.desc}</div>
            </div>
            <div className="station-play">
              {current?.name === station.name && loading ? '⏳' :
               current?.name === station.name && error ? '⚠️' :
               current?.name === station.name && playing ? '⏸' : '▶'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
