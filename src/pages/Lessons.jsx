import { useState } from 'react'
import './Lessons.css'

const CATEGORIES = [
  {
    name: '📖 تفسير',
    lessons: [
      { title: 'تفسير سورة الفاتحة كامل', speaker: 'الشعراوي', search: 'الشعراوي تفسير سورة الفاتحة كامل' },
      { title: 'تفسير سورة البقرة', speaker: 'الشعراوي', search: 'الشعراوي تفسير سورة البقرة' },
      { title: 'تفسير سورة يس', speaker: 'الشعراوي', search: 'الشعراوي تفسير سورة يس كامل' },
      { title: 'تفسير سورة الكهف', speaker: 'الشعراوي', search: 'الشعراوي تفسير سورة الكهف' },
      { title: 'تفسير سورة الرحمن', speaker: 'الشعراوي', search: 'الشعراوي تفسير سورة الرحمن' },
      { title: 'تفسير سورة الملك', speaker: 'الشعراوي', search: 'الشعراوي تفسير سورة الملك' },
      { title: 'تفسير جزء عم كامل', speaker: 'الشعراوي', search: 'الشعراوي تفسير جزء عم كامل' },
      { title: 'تفسير آية الكرسي', speaker: 'النابلسي', search: 'النابلسي تفسير آية الكرسي' },
    ]
  },
  {
    name: '💚 سيرة',
    lessons: [
      { title: 'السيرة النبوية كاملة', speaker: 'نبيل العوضي', search: 'نبيل العوضي السيرة النبوية كاملة' },
      { title: 'مولد النبي ﷺ', speaker: 'نبيل العوضي', search: 'نبيل العوضي مولد النبي' },
      { title: 'الهجرة النبوية', speaker: 'طارق السويدان', search: 'طارق السويدان الهجرة النبوية' },
      { title: 'غزوة بدر الكبرى', speaker: 'نبيل العوضي', search: 'نبيل العوضي غزوة بدر' },
      { title: 'فتح مكة', speaker: 'نبيل العوضي', search: 'نبيل العوضي فتح مكة' },
      { title: 'وفاة النبي ﷺ', speaker: 'نبيل العوضي', search: 'نبيل العوضي وفاة النبي مؤثر' },
    ]
  },
  {
    name: '🌟 أنبياء',
    lessons: [
      { title: 'قصة آدم عليه السلام', speaker: 'نبيل العوضي', id: 'hjjkAQ-9_sk' },
      { title: 'قصة نوح عليه السلام', speaker: 'نبيل العوضي', search: 'نبيل العوضي قصة نوح عليه السلام' },
      { title: 'قصة إبراهيم عليه السلام', speaker: 'نبيل العوضي', search: 'نبيل العوضي قصة ابراهيم' },
      { title: 'قصة يوسف عليه السلام', speaker: 'نبيل العوضي', search: 'نبيل العوضي قصة يوسف' },
      { title: 'قصة موسى عليه السلام', speaker: 'نبيل العوضي', search: 'نبيل العوضي قصة موسى' },
      { title: 'قصة عيسى عليه السلام', speaker: 'نبيل العوضي', search: 'نبيل العوضي قصة عيسى' },
    ]
  },
  {
    name: '🕌 فقه',
    lessons: [
      { title: 'تعلم الصلاة الصحيحة', speaker: '', search: 'تعليم الصلاة الصحيحة بالتفصيل' },
      { title: 'تعلم الوضوء الصحيح', speaker: '', search: 'تعليم الوضوء الصحيح خطوة بخطوة' },
      { title: 'أحكام الصيام', speaker: 'ابن عثيمين', search: 'ابن عثيمين أحكام الصيام' },
      { title: 'أحكام الزكاة', speaker: 'عمر عبد الكافي', search: 'عمر عبد الكافي احكام الزكاة' },
      { title: 'أحكام الحج', speaker: 'ابن عثيمين', search: 'ابن عثيمين أحكام الحج' },
      { title: 'أحكام الطهارة', speaker: 'ابن عثيمين', search: 'ابن عثيمين أحكام الطهارة' },
    ]
  },
  {
    name: '🤲 مواعظ',
    lessons: [
      { title: 'التوبة إلى الله', speaker: 'محمد حسان', search: 'محمد حسان التوبة الى الله' },
      { title: 'الخشوع في الصلاة', speaker: 'النابلسي', search: 'النابلسي الخشوع في الصلاة' },
      { title: 'عذاب القبر', speaker: 'محمد حسان', search: 'محمد حسان عذاب القبر' },
      { title: 'أهوال يوم القيامة', speaker: 'عمر عبد الكافي', search: 'عمر عبد الكافي اهوال يوم القيامة' },
      { title: 'فضل الذكر', speaker: 'النابلسي', search: 'النابلسي فضل الذكر' },
      { title: 'بر الوالدين', speaker: 'محمد حسان', search: 'محمد حسان بر الوالدين' },
    ]
  },
  {
    name: '👶 أطفال',
    lessons: [
      { title: 'تعليم الصلاة للأطفال', speaker: '', search: 'تعليم الصلاة للاطفال بطريقة سهلة' },
      { title: 'تعليم الوضوء للأطفال', speaker: '', search: 'تعليم الوضوء للاطفال' },
      { title: 'جزء عم للأطفال مكرر', speaker: '', search: 'جزء عم كامل للاطفال مكرر بصوت جميل' },
      { title: 'أنشودة أركان الإسلام', speaker: '', search: 'انشودة اركان الاسلام للاطفال' },
      { title: 'قصص القرآن للأطفال', speaker: '', search: 'قصص القران للاطفال كرتون' },
    ]
  },
]

function openVideo(lesson) {
  if (lesson.id) {
    window.open(`https://www.youtube.com/watch?v=${lesson.id}`, '_blank')
  } else {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.search)}`, '_blank')
  }
}

export default function Lessons() {
  const [cat, setCat] = useState(0)

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🎓 دروس ومحاضرات</h1>
        <p>تعلّم دينك من أفضل العلماء</p>
      </div>

      <div className="lessons-cats">
        {CATEGORIES.map((c, i) => (
          <button key={i} className={`lesson-cat-btn${cat === i ? ' active' : ''}`}
            onClick={() => setCat(i)}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="lessons-list">
        {CATEGORIES[cat].lessons.map((l, i) => (
          <button key={i} className="lesson-item card" onClick={() => openVideo(l)}>
            <span className="lesson-play-icon">▶</span>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div className="lesson-title">{l.title}</div>
              {l.speaker && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.speaker}</div>}
            </div>
            <span style={{ fontSize: 10, color: 'var(--accent)' }}>YouTube ←</span>
          </button>
        ))}
      </div>
    </div>
  )
}
