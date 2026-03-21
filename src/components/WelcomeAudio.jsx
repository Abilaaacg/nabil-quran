import { useRef, useState } from 'react'

const isNativeApp = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

const AUDIO_URL = 'https://cdn.islamic.network/quran/audio/128/ar.minshawi/1.mp3'

export default function WelcomeAudio() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)

  if (isNativeApp()) return null

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_URL)
      audioRef.current.volume = 0.85
      audioRef.current.addEventListener('ended', () => setPlaying(false))
    }
    const audio = audioRef.current
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => { setPlaying(true); setStarted(true) }).catch(() => {})
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 90,
      left: 16,
      zIndex: 888,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 8,
    }}>
      {/* بالون تلميح — قبل أول ضغطة */}
      {!started && (
        <div style={{
          background: 'linear-gradient(135deg,#1a3a1a,#0f2010)',
          border: '1px solid rgba(107,192,119,0.6)',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          boxShadow: '0 4px 20px rgba(107,192,119,0.25)',
          animation: 'hint-in 0.5s ease',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }} onClick={toggle}>
          <span style={{ fontSize: 16 }}>🎵</span>
          <div style={{ fontFamily: 'var(--font-arabic)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6bc077' }}>سورة الفاتحة</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>اضغط للاستماع</div>
          </div>
          {/* مؤشر الضغط المتحرك */}
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#6bc077',
            animation: 'dot-blink 1.2s ease infinite',
            flexShrink: 0,
          }} />
        </div>
      )}

      {/* زرار الصوت */}
      <button
        onClick={toggle}
        style={{
          width: 50, height: 50,
          borderRadius: '50%',
          border: playing ? '2px solid #6bc077' : '2px solid rgba(107,192,119,0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          background: playing
            ? 'linear-gradient(135deg,#6bc077,#4a9a56)'
            : 'rgba(15,25,15,0.92)',
          boxShadow: playing
            ? '0 0 0 6px rgba(107,192,119,0.2),0 4px 16px rgba(107,192,119,0.4)'
            : '0 4px 16px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          animation: playing ? 'audio-pulse 1.8s ease infinite' : 'none',
        }}
      >
        {playing ? '🔊' : '🔇'}
      </button>

      <style>{`
        @keyframes audio-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(107,192,119,0.5),0 4px 16px rgba(107,192,119,0.4); }
          70%  { box-shadow: 0 0 0 14px rgba(107,192,119,0),  0 4px 16px rgba(107,192,119,0.4); }
          100% { box-shadow: 0 0 0 0   rgba(107,192,119,0),  0 4px 16px rgba(107,192,119,0.4); }
        }
        @keyframes hint-in {
          from { opacity:0; transform: translateY(8px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes dot-blink {
          0%,100% { opacity:1; transform: scale(1); }
          50%     { opacity:0.3; transform: scale(0.6); }
        }
      `}</style>
    </div>
  )
}
