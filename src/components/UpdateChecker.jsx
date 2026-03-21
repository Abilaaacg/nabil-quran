import { useEffect, useState } from 'react'
import { registerPlugin } from '@capacitor/core'

const UpdatePlugin = registerPlugin('UpdatePlugin')

const isNative = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

const CURRENT = parseInt(import.meta.env.VITE_APP_VERSION || '0')
const REPO = 'Abilaaacg/nabil-quran'

export default function UpdateChecker() {
  const [info, setInfo] = useState(null)
  const [step, setStep] = useState('idle') // idle | downloading

  useEffect(() => {
    if (!CURRENT) return
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
      .then(r => r.json())
      .then(data => {
        const latest = parseInt(data.tag_name?.replace('v', '') || '0')
        if (latest > CURRENT) {
          const apk = data.assets?.find(a => a.name === 'nabil-quran.apk')
          setInfo({ version: data.tag_name, url: apk?.browser_download_url || data.html_url })
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
        // download started — install dialog will appear automatically when done
      } catch {
        setStep('idle')
      }
    } else {
      window.open(info.url, '_blank')
    }
  }

  return (
    <div style={{
      position: 'fixed', bottom: 70, left: 0, right: 0, zIndex: 999,
      display: 'flex', justifyContent: 'center', padding: '0 16px',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'var(--accent)', color: '#fff', borderRadius: 12,
        padding: '12px 20px', display: 'flex', alignItems: 'center',
        gap: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        pointerEvents: 'all', maxWidth: 420, width: '100%',
      }}>
        <span style={{ flex: 1, fontSize: 14, fontFamily: 'var(--font-arabic)' }}>
          تحديث جديد متاح ({info.version})
        </span>
        {step === 'downloading' ? (
          <span style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: 8,
            padding: '6px 14px', fontSize: 13, fontWeight: 700,
            whiteSpace: 'nowrap', fontFamily: 'var(--font-arabic)',
          }}>
            جاري التحميل...
          </span>
        ) : (
          <button
            onClick={handleUpdate}
            style={{
              background: '#fff', color: 'var(--accent)', borderRadius: 8,
              padding: '6px 14px', fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-arabic)',
            }}
          >
            تحديث الآن
          </button>
        )}
        <button
          onClick={() => setInfo(null)}
          style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
            fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
      </div>
    </div>
  )
}
