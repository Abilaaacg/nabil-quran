import React, { useState, useRef } from 'react'
import './Radio.css'

const stations = [
  {
    name: 'إذاعة القرآن الكريم - مكة المكرمة',
    url: 'https://Qurango.net/radio/tarateel',
    flag: '🇸🇦',
    desc: 'البث المباشر من الحرم المكي الشريف',
  },
  {
    name: 'إذاعة القرآن الكريم - مصر',
    url: 'https://media.egyptradio.eg/EgyptRadio/QURAAN.aac',
    flag: '🇪🇬',
    desc: 'القرآن الكريم من القاهرة',
  },
  {
    name: 'إذاعة القرآن الكريم - المدينة',
    url: 'https://stream.radiojar.com/0tpy1h0kxtzuv',
    flag: '🇸🇦',
    desc: 'البث المباشر من المسجد النبوي',
  },
  {
    name: 'Qatar Quran Radio',
    url: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
    flag: '🇶🇦',
    desc: 'إذاعة قرآن كريم قطر',
  },
  {
    name: 'Murattal Radio',
    url: 'https://Qurango.net/radio/murattal',
    flag: '🌍',
    desc: 'إذاعة مرتل',
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
  const [volume, setVolume] = useState(80)
  const audioRef = useRef(null)

  const playStation = (station) => {
    if (current?.name === station.name && playing) {
      audioRef.current?.pause()
      setPlaying(false)
      return
    }
    setCurrent(station)
    setLoading(true)
    setPlaying(false)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load()
        audioRef.current.play()
          .then(() => { setPlaying(true); setLoading(false) })
          .catch(() => setLoading(false))
      }
    }, 100)
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
              <span className={`live-dot ${playing ? 'active' : ''}`}></span>
              {loading ? 'جاري التحميل...' : playing ? 'بث مباشر' : 'متوقف'}
            </div>
            <div className="volume-control">
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span>{volume}%</span>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={current.url}
            onPlaying={() => { setPlaying(true); setLoading(false) }}
            onPause={() => setPlaying(false)}
            onWaiting={() => setLoading(true)}
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
               current?.name === station.name && playing ? '⏸' : '▶'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
