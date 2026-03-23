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

  if (step === 'downloading') {
    return (
      <div style={{
        position: 'fixed', bottom: 64, left: 12, right: 12, zIndex: 999,
        pointerEvents: 'none',
      }}>
        <div style={{
          background: '#1a2f1a', border: '1px solid rgba(107,192,119,0.3)',
          color: '#fff', borderRadius: 10, padding: '10px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          pointerEvents: 'all', fontSize: 13, fontFamily: 'var(--font-arabic)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⬇</span>
          <span style={{ color: '#6bc077', fontWeight: 700 }}>جاري التحميل...</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 64, left: 12, right: 12, zIndex: 999,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'var(--accent)', color: '#fff', borderRadius: 10,
        padding: '8px 12px', display: 'flex', alignItems: 'center',
        gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
        pointerEvents: 'all', fontSize: 13, fontFamily: 'var(--font-arabic)',
      }}>
        <span style={{ flex: 1 }}>📲 تحديث جديد</span>
        <button onClick={handleUpdate} style={{
          background: '#fff', color: 'var(--accent)', borderRadius: 6,
          padding: '4px 10px', fontSize: 12, fontWeight: 700,
          border: 'none', cursor: 'pointer', fontFamily: 'var(--font-arabic)',
        }}>تحديث</button>
        <button onClick={() => setInfo(null)} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
          borderRadius: 4, width: 22, height: 22, cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>
    </div>
  )
}
