import { useState, useEffect } from 'react'
import './WhatsNew.css'

export default function WhatsNew() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/changelog.json?t=' + Date.now())
      .then(r => r.json())
      .then(d => {
        const seen = localStorage.getItem('seen_version')
        if (d.version && d.version !== seen) {
          setData(d)
        }
      })
      .catch(() => {})
  }, [])

  const close = () => {
    if (data) localStorage.setItem('seen_version', data.version)
    setData(null)
  }

  if (!data) return null

  return (
    <div className="wn-overlay" onClick={close}>
      <div className="wn-modal" onClick={e => e.stopPropagation()}>
        <div className="wn-header">
          <div className="wn-icon">✨</div>
          <div>
            <div className="wn-title">{data.title}</div>
            <div className="wn-version">{data.version}</div>
          </div>
        </div>

        <ul className="wn-list">
          {data.changes.map((c, i) => (
            <li key={i} className="wn-item">{c}</li>
          ))}
        </ul>

        <button className="wn-btn" onClick={close}>
          رائع! ابدأ الاستخدام
        </button>
      </div>
    </div>
  )
}
