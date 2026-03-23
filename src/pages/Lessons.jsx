import { useState } from 'react'
import './Lessons.css'

const CATEGORIES = [
  {
    name: '📖 تفسير القرآن', lessons: [
      { title: 'تفسير سورة الفاتحة', speaker: 'الشيخ الشعراوي', videoId: 'XKhMWcRm0yA' },
      { title: 'تفسير سورة البقرة', speaker: 'الشيخ الشعراوي', videoId: 'Y_2YmCwTxoQ' },
      { title: 'تفسير سورة يس', speaker: 'الشيخ الشعراوي', videoId: 'QKJqN3c9FYc' },
      { title: 'تفسير سورة الرحمن', speaker: 'الشيخ الشعراوي', videoId: '8HaF8Abchg0' },
      { title: 'تفسير سورة الملك', speaker: 'الشيخ الشعراوي', videoId: 'vCqN9xFJd9M' },
    ]
  },
  {
    name: '🕌 الفقه والعبادات', lessons: [
      { title: 'أحكام الصلاة كاملة', speaker: 'د. محمد راتب النابلسي', videoId: '7q6FhDLSktU' },
      { title: 'أحكام الصيام', speaker: 'د. محمد راتب النابلسي', videoId: '1sFVrYbnmDI' },
      { title: 'أحكام الزكاة', speaker: 'د. عمر عبد الكافي', videoId: 'ZjIxRFtGnWs' },
      { title: 'أحكام الحج والعمرة', speaker: 'د. عمر عبد الكافي', videoId: 'hQzXpbl7tPU' },
      { title: 'أحكام الوضوء والطهارة', speaker: 'الشيخ ابن عثيمين', videoId: 'Dd7qJx4MfHE' },
    ]
  },
  {
    name: '💚 السيرة النبوية', lessons: [
      { title: 'مولد النبي ﷺ ونشأته', speaker: 'الشيخ نبيل العوضي', videoId: 'MhZB7mOEBaA' },
      { title: 'بعثة النبي ﷺ', speaker: 'الشيخ نبيل العوضي', videoId: 'a3GTBqe9nJo' },
      { title: 'الهجرة النبوية', speaker: 'د. طارق السويدان', videoId: 'i5OYkgj-uZk' },
      { title: 'غزوة بدر الكبرى', speaker: 'د. طارق السويدان', videoId: 'c3ue-rZonuo' },
      { title: 'فتح مكة', speaker: 'الشيخ نبيل العوضي', videoId: 'AxShb-MzVoY' },
    ]
  },
  {
    name: '🌟 قصص الأنبياء', lessons: [
      { title: 'قصة آدم عليه السلام', speaker: 'الشيخ نبيل العوضي', videoId: 'qctE50a-w_E' },
      { title: 'قصة نوح عليه السلام', speaker: 'الشيخ نبيل العوضي', videoId: 'aDIH9YVMbFA' },
      { title: 'قصة إبراهيم عليه السلام', speaker: 'الشيخ نبيل العوضي', videoId: 'SqCFWOkj1Es' },
      { title: 'قصة يوسف عليه السلام', speaker: 'الشيخ نبيل العوضي', videoId: '6uyuxU-dLj0' },
      { title: 'قصة موسى عليه السلام', speaker: 'الشيخ نبيل العوضي', videoId: 'S19UNEhz1WQ' },
    ]
  },
  {
    name: '🤲 الرقائق والإيمانيات', lessons: [
      { title: 'الخشوع في الصلاة', speaker: 'د. محمد راتب النابلسي', videoId: 'g01gN7P3oz0' },
      { title: 'التوبة والرجوع إلى الله', speaker: 'الشيخ محمد حسان', videoId: 'KZ5rrsHqBwQ' },
      { title: 'حسن الخلق', speaker: 'د. عمر عبد الكافي', videoId: 'TpGnAeBhJB0' },
      { title: 'الصبر على البلاء', speaker: 'الشيخ محمد حسان', videoId: 'HLxjsqLvbXs' },
      { title: 'فضل الذكر', speaker: 'د. محمد راتب النابلسي', videoId: 'EJRa_cJzo0I' },
    ]
  },
]

export default function Lessons() {
  const [selectedCat, setSelectedCat] = useState(0)
  const [playing, setPlaying] = useState(null)

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🎓 دروس ومحاضرات</h1>
        <p>تعلّم دينك من أفضل العلماء والدعاة</p>
      </div>

      <div className="lessons-cats">
        {CATEGORIES.map((cat, i) => (
          <button key={i} className={`lesson-cat-btn${selectedCat === i ? ' active' : ''}`} onClick={() => { setSelectedCat(i); setPlaying(null) }}>
            {cat.name}
          </button>
        ))}
      </div>

      {playing !== null && (
        <div className="lesson-player card">
          <div className="lesson-video-wrap">
            <iframe
              src={`https://www.youtube.com/embed/${CATEGORIES[selectedCat].lessons[playing].videoId}?autoplay=1`}
              title={CATEGORIES[selectedCat].lessons[playing].title}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
          <div className="lesson-playing-info">
            <strong>{CATEGORIES[selectedCat].lessons[playing].title}</strong>
            <span>{CATEGORIES[selectedCat].lessons[playing].speaker}</span>
          </div>
        </div>
      )}

      <div className="lessons-list">
        {CATEGORIES[selectedCat].lessons.map((lesson, i) => (
          <button key={i} className={`lesson-item card${playing === i ? ' active' : ''}`} onClick={() => setPlaying(i)}>
            <span className="lesson-play-icon">{playing === i ? '⏸' : '▶'}</span>
            <div className="lesson-info">
              <div className="lesson-title">{lesson.title}</div>
              <div className="lesson-speaker">{lesson.speaker}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
