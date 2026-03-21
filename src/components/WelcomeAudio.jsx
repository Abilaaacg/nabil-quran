import { useEffect, useRef, useState } from 'react'

const isNativeApp = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

// سورة الفاتحة — المنشاوي
const AUDIO_URL = 'https://cdn.islamic.network/quran/audio/128/ar.minshawi/1.mp3'

export default function WelcomeAudio() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const played = useRef(false)

  useEffect(() => {
    if (isNativeApp()) return

    const audio = new Audio(AUDIO_URL)
    audio.volume = 0.7
    audioRef.current = audio

    audio.addEventListener('canplaythrough', () => setReady(true))
    audio.addEventListener('ended', () => setPlaying(false))
    audio.load()

    // حيلة تجاوز حظر المتصفح:
    // نشغّل مكتوم أولاً (المتصفح يسمح بده دايماً)
    // ثم نفتح الصوت فوراً بعد ما التشغيل يبدأ
    const tryPlay = () => {
      if (played.current) return
      played.current = true
      audio.muted = true
      audio.play()
        .then(() => {
          audio.muted = false  // المتصفح سمح → افتح الصوت
          setPlaying(true)
        })
        .catch(() => {
          // المتصفح رفض حتى المكتوم → نستنى تفاعل المستخدم
          played.current = false
        })
    }

    tryPlay()

    // fallback: أول تفاعل من المستخدم
    const onInteract = () => {
      if (!played.current) tryPlay()
      window.removeEventListener('click', onInteract)
      window.removeEventListener('touchstart', onInteract)
      window.removeEventListener('scroll', onInteract)
    }
    window.addEventListener('click', onInteract, { once: true })
    window.addEventListener('touchstart', onInteract, { once: true })
    window.addEventListener('scroll', onInteract, { once: true })

    return () => {
      audio.pause()
      window.removeEventListener('click', onInteract)
      window.removeEventListener('touchstart', onInteract)
      window.removeEventListener('scroll', onInteract)
    }
  }, [])

  if (isNativeApp()) return null

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    played.current = true
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.currentTime = 0
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  return (
    <button
      onClick={toggle}
      title={playing ? 'إيقاف التلاوة' : 'تشغيل سورة الفاتحة'}
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 888,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        background: playing
          ? 'linear-gradient(135deg, #6bc077, #4a9a56)'
          : 'rgba(30,50,30,0.92)',
        boxShadow: playing
          ? '0 0 0 4px rgba(107,192,119,0.3), 0 4px 16px rgba(107,192,119,0.4)'
          : '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        animation: playing ? 'pulse-ring 1.8s ease infinite' : 'none',
      }}
    >
      {playing ? '🔊' : '🔇'}
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(107,192,119,0.5), 0 4px 16px rgba(107,192,119,0.4); }
          70%  { box-shadow: 0 0 0 12px rgba(107,192,119,0),   0 4px 16px rgba(107,192,119,0.4); }
          100% { box-shadow: 0 0 0 0   rgba(107,192,119,0),   0 4px 16px rgba(107,192,119,0.4); }
        }
      `}</style>
    </button>
  )
}
