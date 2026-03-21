import React, { useState, useRef, useEffect } from 'react'
import './Radio.css'

export default function Radio() {
  const [stations, setStations] = useState([])
  const [loadingStations, setLoadingStations] = useState(true)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [volume, setVolume] = useState(80)
  const [search, setSearch] = useState('')
  const audioRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    fetch('https://mp3quran.net/api/v3/radios?language=ar')
      .then(r => r.json())
      .then(data => {
        if (data.radios) setStations(data.radios)
      })
      .catch(() => {})
      .finally(() => setLoadingStations(false))
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const startTimeout = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setLoading(false)
      setError(true)
      audioRef.current?.pause()
    }, 12000)
  }

  const playStation = (station) => {
    if (current?.id === station.id && playing) {
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
    if (!current) return
    setError(false)
    setLoading(true)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load()
        audioRef.current.play().catch(() => { setLoading(false); setError(true) })
        startTimeout()
      }
    }, 100)
  }

  const filtered = stations.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>📻 الإذاعة</h1>
        <p>إذاعات القرآن الكريم والراديو الإسلامي</p>
      </div>

      {/* مشغل الإذاعة الحالية */}
      {current && (
        <div className="radio-player card mb-4">
          <div className="radio-player-info">
            <div className="radio-flag">📡</div>
            <div>
              <div className="radio-name">{current.name}</div>
            </div>
          </div>
          <div className="radio-controls">
            <div className="live-indicator">
              {error ? (
                <>
                  <span style={{ color: 'var(--danger)', fontSize: 13 }}>⚠️ البث غير متاح</span>
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
              <input type="range" min="0" max="100" value={volume}
                onChange={e => {
                  const v = parseInt(e.target.value)
                  setVolume(v)
                  if (audioRef.current) audioRef.current.volume = v / 100
                }}
                className="volume-slider"
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

      {/* بحث */}
      <input
        type="text"
        placeholder="ابحث عن إذاعة..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="radio-search"
        dir="rtl"
      />

      {/* قائمة الإذاعات */}
      {loadingStations ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>جاري تحميل الإذاعات...</p>
        </div>
      ) : (
        <div className="stations-list">
          {filtered.map((station) => (
            <button
              key={station.id}
              className={`station-item ${current?.id === station.id ? 'active' : ''}`}
              onClick={() => playStation(station)}
            >
              <div className="station-flag">📻</div>
              <div className="station-info">
                <div className="station-name">{station.name}</div>
              </div>
              <div className="station-play">
                {current?.id === station.id && loading ? '⏳' :
                 current?.id === station.id && error ? '⚠️' :
                 current?.id === station.id && playing ? '⏸' : '▶'}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
              لا توجد نتائج
            </div>
          )}
        </div>
      )}
    </div>
  )
}
