import { useState } from 'react'
import './Lessons.css'

const CATEGORIES = [
  {
    name: '📖 تفسير',
    lessons: [
      { title: 'تفسير سورة الفاتحة', speaker: 'الشعراوي', id: 'J96bCQiU0gk' },
      { title: 'تفسير سورة البقرة', speaker: 'الشعراوي', id: 'vU2gFxQxKQ4' },
      { title: 'تفسير سورة يس', speaker: 'الشعراوي', id: 'Pb0kBo9MFMo' },
      { title: 'تفسير سورة الملك', speaker: 'الشعراوي', id: 'Gg43y8zFMiU' },
      { title: 'تفسير سورة الرحمن', speaker: 'الشعراوي', id: 'yXIL3TEnL2M' },
      { title: 'تفسير جزء عم', speaker: 'الشعراوي', id: 'nNZE8gVA6WM' },
    ]
  },
  {
    name: '💚 سيرة',
    lessons: [
      { title: 'السيرة النبوية كاملة', speaker: 'نبيل العوضي', id: 'DFIyHEB6LQQ' },
      { title: 'قصة الهجرة النبوية', speaker: 'نبيل العوضي', id: 'vVFxjGJDn-Q' },
      { title: 'غزوة بدر الكبرى', speaker: 'نبيل العوضي', id: 'RnNTFQGwjpM' },
      { title: 'فتح مكة', speaker: 'نبيل العوضي', id: 'f8-pJKkXfOo' },
      { title: 'وفاة النبي ﷺ', speaker: 'نبيل العوضي', id: 'BrVkEK8sxKk' },
    ]
  },
  {
    name: '🌟 أنبياء',
    lessons: [
      { title: 'قصة آدم عليه السلام', speaker: 'نبيل العوضي', id: 'Tgq6K3h2N4Q' },
      { title: 'قصة نوح عليه السلام', speaker: 'نبيل العوضي', id: '3r-qz_s3GjY' },
      { title: 'قصة إبراهيم عليه السلام', speaker: 'نبيل العوضي', id: 'hGU2RFR0BkI' },
      { title: 'قصة يوسف عليه السلام', speaker: 'نبيل العوضي', id: 'WKFtXODGZHs' },
      { title: 'قصة موسى عليه السلام', speaker: 'نبيل العوضي', id: 'FYkjYESCkNM' },
    ]
  },
  {
    name: '🕌 فقه',
    lessons: [
      { title: 'تعلم الصلاة الصحيحة', speaker: 'محمد حسين يعقوب', id: 'T4t9MR9sCpA' },
      { title: 'تعلم الوضوء الصحيح', speaker: '', id: 'mQVsFQ3WDxs' },
      { title: 'أحكام الصيام', speaker: 'ابن عثيمين', id: '1sFVrYbnmDI' },
      { title: 'أحكام الزكاة', speaker: 'عمر عبد الكافي', id: 'ZjIxRFtGnWs' },
    ]
  },
  {
    name: '🤲 مواعظ',
    lessons: [
      { title: 'هل تعلم لماذا نصلي؟', speaker: 'عمر عبد الكافي', id: 'TpGnAeBhJB0' },
      { title: 'التوبة إلى الله', speaker: 'محمد حسان', id: 'KZ5rrsHqBwQ' },
      { title: 'قصة أصحاب الكهف', speaker: 'نبيل العوضي', id: 'eL-GmVj3r6w' },
      { title: 'عذاب القبر', speaker: 'محمد حسان', id: 'HLxjsqLvbXs' },
    ]
  },
  {
    name: '👶 أطفال',
    lessons: [
      { title: 'تعليم الصلاة للأطفال', speaker: '', id: 'T4t9MR9sCpA' },
      { title: 'تعليم الوضوء للأطفال', speaker: '', id: 'mQVsFQ3WDxs' },
      { title: 'جزء عم كامل للأطفال', speaker: 'مشاري العفاسي', id: 'biBSJEHPFJg' },
      { title: 'أنشودة أركان الإسلام', speaker: '', id: 'ZGFgALJjmzM' },
    ]
  },
]

export default function Lessons() {
  const [cat, setCat] = useState(0)
  const [playing, setPlaying] = useState(null)

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🎓 دروس ومحاضرات</h1>
        <p>تعلّم دينك من أفضل العلماء</p>
      </div>

      <div className="lessons-cats">
        {CATEGORIES.map((c, i) => (
          <button key={i} className={`lesson-cat-btn${cat === i ? ' active' : ''}`}
            onClick={() => { setCat(i); setPlaying(null) }}>
            {c.name}
          </button>
        ))}
      </div>

      {playing !== null && (
        <div className="lesson-player card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              src={`https://www.youtube.com/embed/${CATEGORIES[cat].lessons[playing].id}?autoplay=1&rel=0`}
              title="video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{ padding: '10px 14px', direction: 'rtl' }}>
            <strong style={{ fontSize: 14 }}>{CATEGORIES[cat].lessons[playing].title}</strong>
            {CATEGORIES[cat].lessons[playing].speaker && (
              <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>{CATEGORIES[cat].lessons[playing].speaker}</div>
            )}
          </div>
        </div>
      )}

      <div className="lessons-list">
        {CATEGORIES[cat].lessons.map((l, i) => (
          <button key={i} className={`lesson-item card${playing === i ? ' active' : ''}`}
            onClick={() => setPlaying(i)}>
            <span className="lesson-play-icon">{playing === i ? '⏸' : '▶'}</span>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div className="lesson-title">{l.title}</div>
              {l.speaker && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.speaker}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
