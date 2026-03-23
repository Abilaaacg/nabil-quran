import { useEffect, useState } from 'react'
import { registerPlugin } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const UpdatePlugin = registerPlugin('UpdatePlugin')

const isNative = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

const CURRENT = parseInt(import.meta.env.VITE_APP_VERSION || '0')
const VERSION_URL = 'https://nabil-quran.netlify.app/version.json'
const NOTIF_KEY = 'notified_version'

async function sendUpdateNotification(version) {
  if (!isNative()) return
  try {
    const already = localStorage.getItem(NOTIF_KEY)
    if (already === version) return

    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== 'granted') return

    await LocalNotifications.createChannel({
      id: 'updates',
      name: 'تحديثات التطبيق',
      importance: 5,
      visibility: 1,
      vibration: true,
      sound: 'default',
    })

    await LocalNotifications.schedule({
      notifications: [{
        id: 1001,
        title: '📲 تحديث جديد متاح!',
        body: `نور الإسلام ${version} — اضغط للتحديث الآن`,
        channelId: 'updates',
        smallIcon: 'ic_launcher',
        extra: null,
      }]
    })

    localStorage.setItem(NOTIF_KEY, version)
  } catch (e) {
    console.error('notification error:', e)
  }
}

export default function UpdateChecker() {
  const [info, setInfo] = useState(null)
  const [step, setStep] = useState('idle')

  useEffect(() => {
    if (!CURRENT) return
    fetch(VERSION_URL + '?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        const latest = parseInt(data.version?.replace('v', '') || '0')
        if (latest > CURRENT && data.url) {
          const info = { version: data.version, url: data.url }
          setInfo(info)
          sendUpdateNotification(info.version)
        }
      })
      .catch(() => {})
  }, [])

  if (!info) return null

  const handleUpdate = async () => {
    if (isNative()) {
      setStep('downloading')
      try {
        await UpdatePlugin.downloadAndInstall({ url: info.url })
      } catch {
        setStep('idle')
      }
    } else {
      window.open(info.url, '_blank')
    }
  }

  const s = {
    bar: { position: 'fixed', bottom: 62, left: 10, right: 10, zIndex: 999 },
    pill: {
      background: 'var(--accent)', color: '#fff', borderRadius: 8,
      padding: '6px 10px', display: 'flex', alignItems: 'center',
      gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      fontSize: 12, fontFamily: 'var(--font-arabic)',
    },
    btn: {
      background: '#fff', color: 'var(--accent)', borderRadius: 5,
      padding: '3px 8px', fontSize: 11, fontWeight: 700,
      border: 'none', cursor: 'pointer',
    },
    x: {
      background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
      borderRadius: 4, width: 18, height: 18, cursor: 'pointer', fontSize: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
  }

  if (step === 'downloading') {
    return <div style={s.bar}><div style={{ ...s.pill, background: '#1a2f1a' }}>⬇ <span style={{ color: '#6bc077' }}>جاري التحميل...</span></div></div>
  }

  return (
    <div style={s.bar}>
      <div style={s.pill}>
        <span style={{ flex: 1 }}>📲 تحديث</span>
        <button onClick={handleUpdate} style={s.btn}>تحديث</button>
        <button onClick={() => setInfo(null)} style={s.x}>×</button>
      </div>
    </div>
  )
}
