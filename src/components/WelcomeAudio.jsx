import { useEffect, useRef, useState } from 'react'

const isNativeApp = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

const AUDIO_URL = 'https://cdn.islamic.network/quran/audio/128/ar.minshawi/1.mp3'

export default function WelcomeAudio() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const played = useRef(false)

  useEffect(() => {
    if (isNativeApp()) return

    const audio = new Audio(AUDIO_URL)
    audio.volume = 0.8
    audioRef.current = audio
    audio.addEventListener('ended', () => setPlaying(false))
    audio.load()

    const tryPlay = () => {
      if (played.current) return
      played.current = true
      audio.muted = true
      audio.play()
        .then(() => {
          audio.muted = false
          setPlaying(true)
          setShowPrompt(false)
        })
        .catch(() => {
          played.current = false
          setShowPrompt(true) // موبايل: اطلب من المستخدم يضغط
        })
    }

    // محاولة تلقائية بعد 500ms
    const t = setTimeout(tryPlay, 500)

    // fallback عند أي تفاعل
    const onInteract = () => {
      if (!played.current) tryPlay()
    }
    window.addEventListener('touchstart', onInteract, { once: true })
    window.addEventListener('click', onInteract, { once: true })

    return () => {
      clearTimeout(t)
      audio.pause()
      window.removeEventListener('touchstart', onInteract)
      window.removeEventListener('click', onInteract)
    }
  }, [])

  if (isNativeApp()) return null

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    played.current = true
    setShowPrompt(false)
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.currentTime = 0
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  return (
    <>
      {/* زرار الصوت */}
      <button
        onClick={toggle}
        title={playing ? 'إيقاف' : 'تشغيل سورة الفاتحة'}
        style={{
          position: 'fixed',
          bottom: 90,
          left: 16,
          zIndex: 888,
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: playing ? '2px solid #6bc077' : '2px solid rgba(107,192,119,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          background: playing ? 'linear-gradient(135deg,#6bc077,#4a9a56)' : 'rgba(20,35,20,0.92)',
          boxShadow: playing ? '0 0 0 6px rgba(107,192,119,0.2),0 4px 16px rgba(107,192,119,0.4)' : '0 4px 16px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          animation: playing ? 'audio-pulse 1.8s ease infinite' : 'none',
        }}
      >
        {playing ? '🔊' : '🔇'}
      </button>

      {/* بروميت على الموبايل */}
      {showPrompt && (
        <div
          onClick={toggle}
          style={{
            position: 'fixed',
            bottom: 150,
            left: 12,
            zIndex: 889,
            background: 'linear-gradient(135deg,#1a2f1a,#0f1f0f)',
            border: '1px solid rgba(107,192,119,0.5)',
            borderRadius: 14,
            padding: '10px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 20px rgba(107,192,119,0.3)',
            animation: 'slide-up 0.4s ease',
          }}
        >
          <span style={{ fontSize: 20 }}>🎵</span>
          <div style={{ fontFamily: 'var(--font-arabic)', lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6bc077' }}>اضغط للاستماع</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>سورة الفاتحة</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes audio-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(107,192,119,0.5),0 4px 16px rgba(107,192,119,0.4); }
          70%  { box-shadow: 0 0 0 12px rgba(107,192,119,0),  0 4px 16px rgba(107,192,119,0.4); }
          100% { box-shadow: 0 0 0 0   rgba(107,192,119,0),  0 4px 16px rgba(107,192,119,0.4); }
        }
        @keyframes slide-up {
          from { opacity:0; transform: translateY(12px); }
          to   { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
