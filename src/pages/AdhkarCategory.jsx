import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { azkar } from '../data/azkar'
import './AdhkarCategory.css'

const CATEGORY_MAP = {
  morning:  { title: 'أذكار الصباح',       icon: '🌅' },
  evening:  { title: 'أذكار المساء',       icon: '🌆' },
  prayer:   { title: 'أذكار بعد الصلاة',   icon: '🕌' },
  sleeping: { title: 'أذكار النوم',         icon: '🌙' },
  tasbih:   { title: 'التسبيح والتهليل',   icon: '📿' },
  food:     { title: 'أذكار الطعام',       icon: '🍽️' },
}

export default function AdhkarCategory() {
  const { category } = useParams()
  const { settings } = useApp()
  const [counters, setCounters] = useState({})

  const catInfo = CATEGORY_MAP[category] || { title: 'الأذكار', icon: '📿' }
  const adhkar = azkar[category] || []

  const increment = (index) => {
    setCounters(prev => ({ ...prev, [index]: (prev[index] || 0) + 1 }))
  }

  const reset = (index) => {
    setCounters(prev => ({ ...prev, [index]: 0 }))
  }

  const fontSize = settings.adhkarFontSize || 20

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <Link to="/adhkar" className="back-btn">← الأذكار</Link>
        <h1>{catInfo.icon} {catInfo.title}</h1>
      </div>

      {adhkar.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          لا توجد أذكار في هذا القسم
        </div>
      )}

      <div className="dhikr-list">
        {adhkar.map((dhikr, i) => {
          const text = dhikr.zekr || ''
          const count = dhikr.count || '1'
          const desc = dhikr.description || ''
          const ref = dhikr.reference || ''
          const current = counters[i] || 0
          const total = parseInt(count) || 1
          const done = current >= total

          return (
            <div key={i} className={`dhikr-card ${done ? 'dhikr-done' : ''}`}>
              <div className="dhikr-number">{i + 1}</div>
              <p
                className="dhikr-text arabic-text"
                style={{ fontSize: `${fontSize}px` }}
              >
                {text}
              </p>
              {desc && <p className="dhikr-desc">{desc}</p>}
              <div className="dhikr-footer">
                <div className="dhikr-counter">
                  <button
                    onClick={() => !done && increment(i)}
                    className={`counter-btn ${done ? 'counter-done' : ''}`}
                  >
                    {done ? '✓ اكتمل' : `${current} / ${total}`}
                  </button>
                  {current > 0 && (
                    <button onClick={() => reset(i)} className="reset-btn">↺</button>
                  )}
                </div>
                <div className="dhikr-meta">
                  {count !== '1' && <span className="dhikr-repeat">التكرار: {count}</span>}
                  {ref && <span className="dhikr-ref">📚 {ref}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
