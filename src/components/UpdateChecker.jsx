import { useEffect, useState } from 'react'
import { registerPlugin } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const UpdatePlugin = registerPlugin('UpdatePlugin')

const isNative = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || navigator.userAgent?.includes('CapacitorWebView'))

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
    await LocalNotifications.createChannel({ id: 'updates', name: 'تحديثات التطبيق', importance: 5, sound: 'default', vibration: true }).catch(() => {})
    await LocalNotifications.schedule({ notifications: [{ id: 1001, title: '📲 تحديث جديد متاح!', body: `نور الإسلام ${version} — اضغط للتحديث`, channelId: 'updates', smallIcon: 'ic_launcher' }] })
    localStorage.setItem(NOTIF_KEY, version)
  } catch {}
}

export default function UpdateChecker() {
  const [info, setInfo] = useState(null)
  const [step, setStep] = useState('idle') // idle | downloading | conflict

  useEffect(() => {
    if (!CURRENT) return
    fetch(VERSION_URL + '?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        const latest = parseInt(data.version?.replace('v', '') || '0')
        if (latest > CURRENT && data.url) {
          const d = { version: data.version, url: data.url }
          setInfo(d)
          sendUpdateNotification(d.version)
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
        // بعد التحميل، لو المستخدم رجع يعني فشل التثبيت
        setTimeout(() => setStep('conflict'), 8000)
      } catch {
        setStep('conflict')
      }
    } else {
      window.open(info.url, '_blank')
    }
  }

  const base = {
    position: 'fixed', left: 10, right: 10, zIndex: 999,
    fontFamily: 'var(--font-arabic)', direction: 'rtl',
  }

  // رسالة تعارض التوقيع
  if (step === 'conflict') {
    return (
      <div style={{ ...base, bottom: 62 }}>
        <div style={{
          background: '#1a1a2e', border: '1px solid rgba(107,192,119,0.3)',
          borderRadius: 10, padding: '12px 14px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)', color: '#fff',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#6bc077' }}>
            ⚠️ مطلوب إجراء لمرة واحدة فقط
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
            نعتذر — تم تحسين نظام التحديثات. يرجى إزالة التطبيق القديم ثم تثبيت الجديد من إشعار التحميل.
            <br />بعد هذه المرة، كل التحديثات القادمة ستعمل تلقائياً بدون أي مشاكل.
            <br /><span style={{ color: '#6bc077' }}>تحيات م. أحمد نبيل 🙏</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleUpdate} style={{
              flex: 1, background: '#6bc077', color: '#fff', border: 'none',
              borderRadius: 6, padding: '6px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>📲 تحميل النسخة الجديدة</button>
            <button onClick={() => setStep('idle')} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#999',
              borderRadius: 6, padding: '6px 10px', fontSize: 11, cursor: 'pointer',
            }}>لاحقاً</button>
          </div>
        </div>
      </div>
    )
  }

  // جاري التحميل
  if (step === 'downloading') {
    return (
      <div style={{ ...base, bottom: 62 }}>
        <div style={{
          background: '#1a2f1a', border: '1px solid rgba(107,192,119,0.3)',
          borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#6bc077',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>⬇ جاري التحميل...</div>
      </div>
    )
  }

  // شريط التحديث الصغير
  return (
    <div style={{ ...base, bottom: 62 }}>
      <div style={{
        background: 'var(--accent)', color: '#fff', borderRadius: 8,
        padding: '6px 10px', display: 'flex', alignItems: 'center',
        gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', fontSize: 12,
      }}>
        <span style={{ flex: 1 }}>📲 تحديث جديد</span>
        <button onClick={handleUpdate} style={{
          background: '#fff', color: 'var(--accent)', borderRadius: 5,
          padding: '3px 8px', fontSize: 11, fontWeight: 700,
          border: 'none', cursor: 'pointer',
        }}>تحديث</button>
        <button onClick={() => setInfo(null)} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
          borderRadius: 4, width: 18, height: 18, cursor: 'pointer', fontSize: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>
    </div>
  )
}
