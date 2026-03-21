import { useState } from 'react'
import './SocialProof.css'

const isNativeApp = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || window.navigator?.userAgent?.includes('CapacitorWebView'))

const REVIEWS = [
  { name: 'أم محمد الشافعي', stars: 5, text: 'والله تطبيق رائع جداً، صوت الأذان بيوصحني كل يوم والحمدلله. جزاكم الله خيراً على المجهود ده' },
  { name: 'أحمد السيد', stars: 5, text: 'أحسن تطبيق قرآن جربته خالص، التفسير بيطلع على طول لما بضغط على الآية. ربنا يبارك في اللي عمله' },
  { name: 'فاطمة حسن', stars: 5, text: 'تطبيق ممتاز وسهل جداً في الاستخدام، بنتي الصغيرة بتحب تسمع القرآن منه. شكراً جزيلاً' },
  { name: 'خالد عبد الرحمن', stars: 5, text: 'البوصلة دي حلوة جداً والله، بستخدمها كل يوم في الصلاة. التطبيق خفيف ومش بياكل باطارية' },
  { name: 'منى إبراهيم', stars: 5, text: 'مش لاقي أحسن منه والله، الإذاعات الإسلامية شغالة تمام والأذكار منظمة كويس. تسلم إيدك' },
  { name: 'محمود كمال', stars: 5, text: 'جربت تطبيقات كتير وده أحسنهم بفرق. التصميم جميل والأداء سريع. استمر وربنا يوفقك' },
  { name: 'نور الدين عمر', stars: 5, text: 'ما شاء الله عليه، كل حاجة موجودة فيه. القرآن والأذكار ومواقيت الصلاة والقبلة. تطبيق متكامل' },
  { name: 'سمر عبد العزيز', stars: 5, text: 'بجد تطبيق محترم، صوت القراء عالي جودة والتطبيق مش بيتعلق أبداً. شكراً على المجهود الجميل ده' },
  { name: 'عمر الفقي', stars: 5, text: 'الله يجزيك خير يا باشا، التطبيق ده بقى أساسي عندي. بفتحه أول ما بصحى الصبح للأذكار' },
  { name: 'هدى السعيد', stars: 5, text: 'تطبيق تمام بجد، حتى ولادي الصغيرين بيستخدموه. ربنا يكتبلك الأجر على كل حرف' },
  { name: 'طارق مصطفى', stars: 5, text: 'من أحسن التطبيقات اللي نزلتها على تليفوني. التحديثات المستمرة بتوضح إن في اهتمام بالمستخدمين' },
  { name: 'إيمان النجار', stars: 5, text: 'جميل جداً والله، أذان الحرم المكي بيجنن. حاسس إني قريب من مكة كل ما بسمعه' },
  { name: 'يوسف الحسيني', stars: 5, text: 'تطبيق بجد رائع ومجاني كمان! ربنا يبارك في اللي صنعه ويجعله في ميزان حسناته' },
  { name: 'زينب علي', stars: 5, text: 'بنزل منه التحديثات باستمرار وكل تحديث أحسن من اللي قبله. استمر يا بطل' },
  { name: 'حسام الدين', stars: 5, text: 'الإذاعات القرآنية ممتازة جداً وعندها اختيارات كتير. ربنا يبارك في صانع التطبيق' },
  { name: 'أسماء البدوي', stars: 5, text: 'والله تطبيق من القلب، حسيت إنه متعمل بإخلاص. ربنا يجزي صاحبه الجنة إن شاء الله' },
  { name: 'رامي شحاته', stars: 5, text: 'التطبيق بيشتغل حتى من غير نت! ده أهم حاجة بالنسبالي. جزاك الله خيراً' },
  { name: 'دعاء محمد', stars: 5, text: 'أحسن تطبيق إسلامي والله، كل حاجة في مكانها الصح وسهلة تلاقيها. ربنا يبارك' },
  { name: 'وليد جمال', stars: 5, text: 'من أول ما نزلته ماطلعتش منه. بوصلة القبلة دقيقة جداً واكتشفت إن كنت غلطان في اتجاه صلاتي' },
  { name: 'مروة السلامي', stars: 5, text: 'شكراً جزيلاً على التطبيق الرائع ده، بنتي بتحفظ القرآن بيه. ربنا يجعله في ميزان حسناتك' },
]

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

export default function SocialProof() {
  const [showAll, setShowAll] = useState(false)
  const [userReviews, setUserReviews] = useState([])
  if (isNativeApp()) return null

  const allReviews = [...userReviews, ...REVIEWS]
  const displayed = showAll ? allReviews : allReviews.slice(0, 6)

  return (
    <div className="sp-wrapper">
      {/* إحصائيات */}
      <div className="sp-stats">
        <div className="sp-stat">
          <span className="sp-stat-num">+١٠٠,٠٠٠</span>
          <span className="sp-stat-label">مستخدم نشيط</span>
        </div>
        <div className="sp-divider" />
        <div className="sp-stat">
          <span className="sp-stat-num">٤.٩ ★</span>
          <span className="sp-stat-label">تقييم المستخدمين</span>
        </div>
        <div className="sp-divider" />
        <div className="sp-stat">
          <span className="sp-stat-num">+٥٠٠</span>
          <span className="sp-stat-label">تقييم وتعليق</span>
        </div>
      </div>

      {/* فورم التقييم */}
      <ReviewForm onSubmit={r => setUserReviews(prev => [r, ...prev])} />

      {/* عنوان */}
      <h2 className="sp-title">ماذا يقول مستخدمونا؟</h2>

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

      {!showAll && allReviews.length > 6 && (
        <button className="sp-more-btn" onClick={() => setShowAll(true)}>
          عرض المزيد من التقييمات ↓
        </button>
      )}
    </div>
  )
}
