import { useState } from 'react'
import './Lessons.css'

const CATEGORIES = [
  {
    name: '📖 تفسير القرآن',
    lessons: [
      { title: 'تفسير سورة الفاتحة — الشعراوي', id: 'dkFVdPkxbIE' },
      { title: 'تفسير سورة البقرة — الشعراوي', id: '8HjEQi1g3Dg' },
      { title: 'تفسير سورة يس — الشعراوي', id: 'PdhGggvN6d4' },
      { title: 'تفسير آية الكرسي — النابلسي', id: 'g01gN7P3oz0' },
      { title: 'تفسير سورة الكهف — الشعراوي', id: 'W7ZIz4w_xF0' },
      { title: 'تفسير سورة الملك — الشعراوي', id: 'rQQZ6Y3F5JI' },
    ]
  },
  {
    name: '💚 السيرة النبوية',
    lessons: [
      { title: 'مولد النبي ﷺ — نبيل العوضي', id: 'MhZB7mOEBaA' },
      { title: 'بعثة النبي ﷺ — نبيل العوضي', id: 'a3GTBqe9nJo' },
      { title: 'الهجرة النبوية — طارق السويدان', id: 'i5OYkgj-uZk' },
      { title: 'غزوة بدر — طارق السويدان', id: 'c3ue-rZonuo' },
      { title: 'فتح مكة — نبيل العوضي', id: 'AxShb-MzVoY' },
    ]
  },
  {
    name: '🌟 قصص الأنبياء',
    lessons: [
      { title: 'قصة آدم عليه السلام', id: 'qctE50a-w_E' },
      { title: 'قصة نوح عليه السلام', id: 'aDIH9YVMbFA' },
      { title: 'قصة إبراهيم عليه السلام', id: 'SqCFWOkj1Es' },
      { title: 'قصة يوسف عليه السلام', id: '6uyuxU-dLj0' },
      { title: 'قصة موسى عليه السلام', id: 'S19UNEhz1WQ' },
    ]
  },
  {
    name: '🕌 أحكام وفقه',
    lessons: [
      { title: 'أحكام الصلاة — ابن عثيمين', id: 'Dd7qJx4MfHE' },
      { title: 'أحكام الصيام — النابلسي', id: '1sFVrYbnmDI' },
      { title: 'أحكام الوضوء', id: '7q6FhDLSktU' },
      { title: 'أحكام الزكاة — عمر عبد الكافي', id: 'ZjIxRFtGnWs' },
      { title: 'أحكام الحج — عمر عبد الكافي', id: 'hQzXpbl7tPU' },
    ]
  },
  {
    name: '🤲 خطب ومواعظ',
    lessons: [
      { title: 'التوبة — محمد حسان', id: 'KZ5rrsHqBwQ' },
      { title: 'الخشوع في الصلاة — النابلسي', id: 'EJRa_cJzo0I' },
      { title: 'حسن الخلق — عمر عبد الكافي', id: 'TpGnAeBhJB0' },
      { title: 'الصبر على البلاء — محمد حسان', id: 'HLxjsqLvbXs' },
      { title: 'فضل الذكر — النابلسي', id: 'g01gN7P3oz0' },
    ]
  },
  {
    name: '👶 أطفال',
    lessons: [
      { title: 'تعليم الصلاة للأطفال', id: 'T4t9MR9sCpA' },
      { title: 'تعليم الوضوء للأطفال', id: 'mQVsFQ3WDxs' },
      { title: 'أنشودة الحروف العربية', id: 'ZGFgALJjmzM' },
      { title: 'سورة الفاتحة مكررة للأطفال', id: 'biBSJEHPFJg' },
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
        <div className="lesson-player card">
          <div className="lesson-video-wrap">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${CATEGORIES[cat].lessons[playing].id}?autoplay=1&rel=0`}
              title="video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="lesson-playing-info">
            <strong>{CATEGORIES[cat].lessons[playing].title}</strong>
          </div>
        </div>
      )}

      <div className="lessons-list">
        {CATEGORIES[cat].lessons.map((l, i) => (
          <button key={i} className={`lesson-item card${playing === i ? ' active' : ''}`}
            onClick={() => setPlaying(i)}>
            <span className="lesson-play-icon">{playing === i ? '⏸' : '▶'}</span>
            <span className="lesson-title">{l.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
