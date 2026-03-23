import { useState, useEffect } from 'react'
import './WhatsNew.css'

export default function WhatsNew() {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    fetch('/changelog.json?t=' + Date.now())
      .then(r => r.json())
      .then(d => {
        const seen = localStorage.getItem('seen_version')
        if (d.version && d.version !== seen) {
          localStorage.setItem('seen_version', d.version)
          setVisible(true)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!visible) return
    if (countdown <= 0) { setVisible(false); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [visible, countdown])

  if (!visible) return null

  return (
    <div className="wn-toast">
      <div className="wn-toast-content">
        <span className="wn-toast-icon">🚀</span>
        <div className="wn-toast-text">
          <strong>تم تحديث التطبيق بنجاح!</strong>
          <span className="wn-toast-sub">تحيات م. أحمد نبيل</span>
        </div>
        <span className="wn-toast-timer">{countdown}</span>
      </div>
      <div className="wn-toast-bar" style={{ width: `${(countdown / 5) * 100}%` }} />
    </div>
  )
}
