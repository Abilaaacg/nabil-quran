import React, { useState, useEffect } from 'react'
import './HisnMuslim.css'

export default function HisnMuslim() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/rn0x/altaqwaa-desktop/main/src/data/hisnmuslim.json')
      .then(r => r.json())
      .then(d => {
        const arr = Array.isArray(d) ? d : d.chapters || d.data || Object.values(d)
        setData(arr)
      })
      .catch(() => setError('تعذر تحميل البيانات'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(item => {
    const title = item.title || item.name || item.chapter || ''
    return title.includes(search)
  })

  if (selected) {
    const title = selected.title || selected.name || selected.chapter || 'باب'
    const items = selected.array || selected.items || selected.duas || []
    return (
      <div className="page-container fade-in">
        <div className="page-header">
          <button className="back-btn" onClick={() => setSelected(null)}>← حصن المسلم</button>
          <h1>{title}</h1>
        </div>
        <div className="hisnmuslim-duas">
          {items.map((item, i) => {
            const text = item.content || item.dua || item.text || ''
            const desc = item.description || item.virtue || item.fadl || ''
            return (
              <div key={i} className="dua-card">
                <div className="dua-number">{i + 1}</div>
                <p className="dua-text arabic-text">{text}</p>
                {desc && <p className="dua-desc">{desc}</p>}
              </div>
            )
          })}
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              لا توجد أدعية
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🛡️ حصن المسلم</h1>
        <p>أدعية وأذكار من كتاب حصن المسلم</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="search-input"
          placeholder="ابحث في الأبواب..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p>جاري التحميل...</p>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', textAlign: 'center', padding: 20 }}>⚠️ {error}</div>
      )}

      {!loading && !error && (
        <div className="hisnmuslim-list">
          {filtered.map((item, i) => {
            const title = item.title || item.name || item.chapter || `باب ${i + 1}`
            const count = (item.array || item.items || item.duas || []).length
            return (
              <button key={i} className="hisnmuslim-item" onClick={() => setSelected(item)}>
                <span className="item-number">{i + 1}</span>
                <div className="item-info">
                  <span className="item-title">{title}</span>
                  {count > 0 && <span className="item-count">{count} دعاء</span>}
                </div>
                <span className="item-arrow">←</span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              لا توجد نتائج
            </div>
          )}
        </div>
      )}
    </div>
  )
}
