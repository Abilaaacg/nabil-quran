import { useState, useEffect } from 'react'
import './WhatsNew.css'

export default function WhatsNew() {
  const [data, setData] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch('/changelog.json?t=' + Date.now())
      .then(r => r.json())
      .then(d => {
        const seen = localStorage.getItem('seen_version')
        if (d.version && d.version !== seen) setData(d)
      })
      .catch(() => {})
  }, [])

  const close = () => {
    if (data) localStorage.setItem('seen_version', data.version)
    setData(null)
  }

  if (!data) return null

  return (
    <div className="wn-banner">
      <div className="wn-bar" onClick={() => setExpanded(!expanded)}>
        <span className="wn-bar-text">🚀 {data.title}</span>
        <span className="wn-bar-arrow">{expanded ? '▲' : '▼'}</span>
        <button className="wn-close" onClick={e => { e.stopPropagation(); close() }}>×</button>
      </div>
      {expanded && (
        <div className="wn-details">
          {data.changes.map((c, i) => (
            <div key={i} className="wn-change">{c}</div>
          ))}
          <button className="wn-got-it" onClick={close}>✓ تم</button>
        </div>
      )}
    </div>
  )
}
