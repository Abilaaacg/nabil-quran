import React, { useState } from 'react'
import './NamesOfAllah.css'

const NAMES = [
  {n:1,  name:'الله',                  meaning:'الاسم الجامع لجميع صفات الكمال'},
  {n:2,  name:'الرحمن',               meaning:'واسع الرحمة لجميع خلقه في الدنيا'},
  {n:3,  name:'الرحيم',               meaning:'بالغ الرحمة للمؤمنين في الآخرة'},
  {n:4,  name:'الملك',                meaning:'المالك لجميع الأشياء'},
  {n:5,  name:'القدوس',               meaning:'المنزّه عن كل نقص وعيب'},
  {n:6,  name:'السلام',               meaning:'ذو السلامة من كل نقص'},
  {n:7,  name:'المؤمن',               meaning:'المصدّق لعباده يوم القيامة'},
  {n:8,  name:'المهيمن',              meaning:'الرقيب الحفيظ على كل شيء'},
  {n:9,  name:'العزيز',               meaning:'الغالب الذي لا يُغلب'},
  {n:10, name:'الجبار',               meaning:'القاهر الذي يجبر الكسر'},
  {n:11, name:'المتكبر',              meaning:'المتعالي عن صفات النقص'},
  {n:12, name:'الخالق',               meaning:'الذي أوجد الأشياء من العدم'},
  {n:13, name:'البارئ',               meaning:'الذي خلق الخلق بلا مثال سابق'},
  {n:14, name:'المصور',               meaning:'الذي يصوّر الخلق كيف يشاء'},
  {n:15, name:'الغفار',               meaning:'الذي يغفر الذنوب مرة بعد مرة'},
  {n:16, name:'القهار',               meaning:'الغالب الذي قهر كل شيء'},
  {n:17, name:'الوهاب',               meaning:'كثير العطاء والمنح بلا عوض'},
  {n:18, name:'الرزاق',               meaning:'الذي يرزق جميع مخلوقاته'},
  {n:19, name:'الفتاح',               meaning:'الذي يفتح أبواب الرزق والرحمة'},
  {n:20, name:'العليم',               meaning:'المحيط بكل شيء علماً'},
  {n:21, name:'القابض',               meaning:'الذي يقبض الأرواح والأرزاق'},
  {n:22, name:'الباسط',               meaning:'الذي يبسط الرزق لمن يشاء'},
  {n:23, name:'الخافض',               meaning:'يخفض من يشاء من الجبابرة'},
  {n:24, name:'الرافع',               meaning:'يرفع المؤمنين بطاعته'},
  {n:25, name:'المعز',                meaning:'يُعزّ من يشاء من عباده'},
  {n:26, name:'المذل',                meaning:'يُذل من يشاء ممن يستحق'},
  {n:27, name:'السميع',               meaning:'المحيط بكل المسموعات'},
  {n:28, name:'البصير',               meaning:'المحيط بكل المبصرات'},
  {n:29, name:'الحكم',                meaning:'الحاكم الذي لا معقّب لحكمه'},
  {n:30, name:'العدل',                meaning:'الذي يقضي بالعدل والإنصاف'},
  {n:31, name:'اللطيف',               meaning:'اللطيف بعباده الخبير بهم'},
  {n:32, name:'الخبير',               meaning:'العالم بدقائق الأمور وخفاياها'},
  {n:33, name:'الحليم',               meaning:'الذي لا يعجل بالعقوبة'},
  {n:34, name:'العظيم',               meaning:'الجليل الكبير ذو العظمة'},
  {n:35, name:'الغفور',               meaning:'كثير المغفرة للذنوب'},
  {n:36, name:'الشكور',               meaning:'الذي يثيب على القليل الكثير'},
  {n:37, name:'العلي',                meaning:'المتعالي فوق جميع خلقه'},
  {n:38, name:'الكبير',               meaning:'الكبير في ذاته وصفاته'},
  {n:39, name:'الحفيظ',               meaning:'الحافظ لكل شيء'},
  {n:40, name:'المقيت',               meaning:'الذي يُوصل الرزق لكل مخلوق'},
  {n:41, name:'الحسيب',               meaning:'الكافي لعباده المحاسب لهم'},
  {n:42, name:'الجليل',               meaning:'العظيم الذي له صفات الجلال'},
  {n:43, name:'الكريم',               meaning:'كثير الخير والعطاء'},
  {n:44, name:'الرقيب',               meaning:'المطّلع على كل شيء'},
  {n:45, name:'المجيب',               meaning:'الذي يُجيب دعاء من يدعوه'},
  {n:46, name:'الواسع',               meaning:'الواسع العلم والرحمة والقدرة'},
  {n:47, name:'الحكيم',               meaning:'الذي يضع الأمور في مواضعها'},
  {n:48, name:'الودود',               meaning:'الذي يحب عباده الصالحين'},
  {n:49, name:'المجيد',               meaning:'العالي القدر الواسع الفضل'},
  {n:50, name:'الباعث',               meaning:'الذي يبعث الخلق يوم القيامة'},
  {n:51, name:'الشهيد',               meaning:'الشاهد على كل شيء'},
  {n:52, name:'الحق',                 meaning:'الموجود حقاً الثابت الوجود'},
  {n:53, name:'الوكيل',               meaning:'الكافي لمن توكّل عليه'},
  {n:54, name:'القوي',                meaning:'الكامل القوة'},
  {n:55, name:'المتين',               meaning:'الشديد القوة الذي لا يُغلب'},
  {n:56, name:'الولي',                meaning:'الناصر لعباده المؤمنين'},
  {n:57, name:'الحميد',               meaning:'المستحق للحمد والثناء'},
  {n:58, name:'المحصي',               meaning:'الذي أحصى كل شيء عدداً'},
  {n:59, name:'المبدئ',               meaning:'الذي بدأ الخلق من العدم'},
  {n:60, name:'المعيد',               meaning:'الذي يُعيد الخلق بعد الموت'},
  {n:61, name:'المحيي',               meaning:'الذي يُحيي الموتى'},
  {n:62, name:'المميت',               meaning:'الذي يميت الأحياء'},
  {n:63, name:'الحي',                 meaning:'الدائم الحياة الذي لا يموت'},
  {n:64, name:'القيوم',               meaning:'القائم على كل شيء'},
  {n:65, name:'الواجد',               meaning:'الغني الذي لا يفتقر'},
  {n:66, name:'الماجد',               meaning:'ذو المجد والكرم والشرف'},
  {n:67, name:'الواحد',               meaning:'الفرد الذي لا شريك له'},
  {n:68, name:'الأحد',                meaning:'المتفرد في وحدانيته'},
  {n:69, name:'الصمد',                meaning:'السيد الذي يُقصد في الحوائج'},
  {n:70, name:'القادر',               meaning:'الذي يقدر على كل شيء'},
  {n:71, name:'المقتدر',              meaning:'التام القدرة على كل شيء'},
  {n:72, name:'المقدم',               meaning:'الذي يُقدّم من يشاء'},
  {n:73, name:'المؤخر',               meaning:'الذي يُؤخّر من يشاء'},
  {n:74, name:'الأول',                meaning:'الذي ليس قبله شيء'},
  {n:75, name:'الآخر',                meaning:'الذي ليس بعده شيء'},
  {n:76, name:'الظاهر',               meaning:'الذي ظهر فوق كل شيء'},
  {n:77, name:'الباطن',               meaning:'المحتجب عن أبصار الخلق'},
  {n:78, name:'الوالي',               meaning:'المالك لجميع الأشياء المتصرف'},
  {n:79, name:'المتعالي',             meaning:'المتنزّه عن صفات النقص'},
  {n:80, name:'البر',                  meaning:'المحسن الكثير البر والإحسان'},
  {n:81, name:'التواب',               meaning:'الذي يتوب على عباده كثيراً'},
  {n:82, name:'المنتقم',              meaning:'الذي ينتقم ممن يستحق'},
  {n:83, name:'العفو',                meaning:'الذي يمحو الذنوب ويتجاوز'},
  {n:84, name:'الرؤوف',               meaning:'بالغ الرأفة والرحمة بعباده'},
  {n:85, name:'مالك الملك',           meaning:'المالك الحقيقي لكل الملك'},
  {n:86, name:'ذو الجلال والإكرام',   meaning:'صاحب العظمة والكرم'},
  {n:87, name:'المقسط',               meaning:'العادل في أحكامه'},
  {n:88, name:'الجامع',               meaning:'الذي يجمع الخلائق ليوم الحساب'},
  {n:89, name:'الغني',                meaning:'المستغني عن كل شيء'},
  {n:90, name:'المغني',               meaning:'الذي يُغني من يشاء'},
  {n:91, name:'المانع',               meaning:'الذي يمنع من يشاء'},
  {n:92, name:'الضار',                meaning:'الذي يضر من يشاء بعدله'},
  {n:93, name:'النافع',               meaning:'الذي ينفع من يشاء بفضله'},
  {n:94, name:'النور',                meaning:'المنوّر للسماوات والأرض'},
  {n:95, name:'الهادي',               meaning:'الذي يهدي من يشاء إلى الحق'},
  {n:96, name:'البديع',               meaning:'المبدع للخلق على غير مثال'},
  {n:97, name:'الباقي',               meaning:'الدائم الباقي بعد فناء الخلق'},
  {n:98, name:'الوارث',               meaning:'الباقي بعد فناء الخلق'},
  {n:99, name:'الرشيد',               meaning:'الذي أرشد الخلق إلى مصالحهم'},
]

// Cycle through a few accent-derived gradient combos per card
const GRADIENTS = [
  'linear-gradient(135deg, rgba(107,192,119,0.18) 0%, rgba(107,192,119,0.06) 100%)',
  'linear-gradient(135deg, rgba(107,192,119,0.14) 0%, rgba(75,160,90,0.08) 100%)',
  'linear-gradient(135deg, rgba(90,175,106,0.20) 0%, rgba(107,192,119,0.05) 100%)',
  'linear-gradient(135deg, rgba(107,192,119,0.10) 0%, rgba(120,200,130,0.16) 100%)',
  'linear-gradient(135deg, rgba(80,168,96,0.16) 0%, rgba(107,192,119,0.10) 100%)',
]

function toArabicNumeral(n) {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])
}

function NameCard({ item, isExpanded, onToggle }) {
  const gradient = GRADIENTS[(item.n - 1) % GRADIENTS.length]

  return (
    <div
      className={`name-card${isExpanded ? ' name-card--expanded' : ''}`}
      style={{ background: gradient }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle()}
      aria-expanded={isExpanded}
    >
      <span className="name-card__number">{toArabicNumeral(item.n)}</span>
      <div className="name-card__arabic">{item.name}</div>
      <div className="name-card__meaning">{item.meaning}</div>

      {isExpanded && (
        <div className="name-card__detail">
          <div className="name-card__divider" />
          <p className="name-card__dhikr">
            يا {item.name}
          </p>
          <p className="name-card__benefit">
            تكرار هذا الاسم ذكرٌ وتقرّبٌ إلى الله تعالى، واستحضارٌ لمعناه في القلب.
          </p>
        </div>
      )}

      <span className="name-card__chevron">{isExpanded ? '▲' : '▼'}</span>
    </div>
  )
}

export default function NamesOfAllah() {
  const [query, setQuery] = useState('')
  const [expandedN, setExpandedN] = useState(null)

  const filtered = NAMES.filter(item =>
    item.name.includes(query.trim()) ||
    item.meaning.includes(query.trim())
  )

  function handleToggle(n) {
    setExpandedN(prev => (prev === n ? null : n))
  }

  return (
    <div className="page-container fade-in noa-page" dir="rtl">

      {/* ── Header ── */}
      <div className="noa-header">
        <div className="noa-header__glow" />
        <div className="noa-header__content">
          <div className="noa-header__icon">✦</div>
          <h1 className="noa-header__title">أسماء الله الحسنى</h1>
          <p className="noa-header__subtitle">
            <span className="noa-header__count">٩٩ اسماً</span>
            {' '}— من أحصاها دخل الجنة
          </p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="noa-search-wrap">
        <span className="noa-search-icon">&#x1F50D;</span>
        <input
          className="noa-search"
          type="text"
          placeholder="ابحث باسم أو معنى…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          dir="rtl"
          aria-label="بحث في أسماء الله الحسنى"
        />
        {query && (
          <button
            className="noa-search-clear"
            onClick={() => setQuery('')}
            aria-label="مسح البحث"
          >×</button>
        )}
      </div>

      {/* ── Result count ── */}
      {query.trim() !== '' && (
        <p className="noa-result-count">
          {filtered.length > 0
            ? `${toArabicNumeral(filtered.length)} نتيجة`
            : 'لا توجد نتائج'}
        </p>
      )}

      {/* ── Grid ── */}
      <div className="noa-grid">
        {filtered.map(item => (
          <NameCard
            key={item.n}
            item={item}
            isExpanded={expandedN === item.n}
            onToggle={() => handleToggle(item.n)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="noa-empty">
          <span className="noa-empty__icon">🔍</span>
          <p>لم يُعثر على اسم مطابق</p>
        </div>
      )}
    </div>
  )
}
