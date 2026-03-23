import { useState, useMemo } from 'react'
import { ALL_REVIEWS, REVIEW_COUNT } from '../data/reviews'
import './SocialProof.css'

const isNativeApp = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || navigator.userAgent?.includes('CapacitorWebView'))

function Stars({ count }) {
  return (
    <span className="sp-stars">
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="sp-star-picker">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`sp-star-pick ${n <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >★</span>
      ))}
    </div>
  )
}

function ReviewForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [stars, setStars] = useState(5)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !text.trim() || !stars) return
    setLoading(true)

    const formData = new FormData()
    formData.append('form-name', 'reviews')
    formData.append('name', name.trim())
    formData.append('stars', stars)
    formData.append('text', text.trim())

    try {
      await fetch('/', { method: 'POST', body: formData })
    } catch { /* ignore */ }

    onSubmit({ name: name.trim(), stars, text: text.trim() })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="sp-form-thanks">
        <span className="sp-thanks-icon">🌟</span>
        <p>جزاك الله خيراً على تقييمك! ظهر تعليقك.</p>
      </div>
    )
  }

  return (
    <form
      className="sp-form"
      onSubmit={handleSubmit}
      name="reviews"
      data-netlify="true"
      netlify-honeypot="bot-field"
    >
      <input type="hidden" name="form-name" value="reviews" />
      <input type="hidden" name="bot-field" />

      <h3 className="sp-form-title">✍️ أضف تقييمك</h3>

      <div className="sp-form-row">
        <input
          className="sp-input"
          type="text"
          name="name"
          placeholder="اسمك"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
          required
        />
        <StarPicker value={stars} onChange={setStars} />
      </div>

      <textarea
        className="sp-textarea"
        name="text"
        placeholder="شاركنا رأيك في التطبيق..."
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        maxLength={300}
        required
      />

      <button className="sp-submit-btn" type="submit" disabled={loading}>
        {loading ? 'جاري الإرسال...' : 'إرسال التقييم ⬅'}
      </button>
    </form>
  )
}

const PAGE_SIZE = 20

export default function SocialProof() {
  const [page, setPage] = useState(1)
  const [userReviews, setUserReviews] = useState([])
  if (isNativeApp()) return null

  const allReviews = useMemo(() => [...userReviews, ...ALL_REVIEWS], [userReviews])
  const displayed = allReviews.slice(0, page * PAGE_SIZE)
  const hasMore = displayed.length < allReviews.length

  return (
    <div className="sp-wrapper">
      {/* إحصائيات */}
      <div className="sp-stats">
        <div className="sp-stat">
          <span className="sp-stat-num">+٢٥٠,٠٠٠</span>
          <span className="sp-stat-label">مستخدم نشيط</span>
        </div>
        <div className="sp-divider" />
        <div className="sp-stat">
          <span className="sp-stat-num">٤.٩ ★</span>
          <span className="sp-stat-label">تقييم المستخدمين</span>
        </div>
        <div className="sp-divider" />
        <div className="sp-stat">
          <span className="sp-stat-num">+{REVIEW_COUNT.toLocaleString('ar-EG')}</span>
          <span className="sp-stat-label">تقييم وتعليق</span>
        </div>
      </div>

      {/* فورم التقييم */}
      <ReviewForm onSubmit={r => setUserReviews(prev => [r, ...prev])} />

      {/* عنوان */}
      <h2 className="sp-title">ماذا يقول مستخدمونا؟ ({allReviews.length.toLocaleString('ar-EG')} تعليق)</h2>

      {/* التعليقات */}
      <div className="sp-grid">
        {displayed.map((r, i) => (
          <div key={i} className={`sp-card ${i < userReviews.length ? 'sp-card-new' : ''}`}>
            <div className="sp-card-top">
              <div className="sp-avatar">{r.name[0]}</div>
              <div>
                <div className="sp-name">{r.name}</div>
                <Stars count={r.stars} />
              </div>
            </div>
            <p className="sp-text">"{r.text}"</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <button className="sp-more-btn" onClick={() => setPage(p => p + 1)}>
          عرض المزيد ({(allReviews.length - displayed.length).toLocaleString('ar-EG')} تعليق متبقي) ↓
        </button>
      )}
    </div>
  )
}
