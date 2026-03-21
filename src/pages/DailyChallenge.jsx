import { useState, useEffect } from 'react'
import './DailyChallenge.css'

const TODAY = new Date().toDateString()
const isJumaa = new Date().getDay() === 5 // الجمعة

const ALL_TASKS = [
  { id: 'fajr',     icon: '🌙', title: 'صلاة الفجر',      desc: 'صلِّ الفجر في وقته', points: 20, category: 'prayer' },
  { id: 'dhuhr',    icon: '☀️', title: 'صلاة الظهر',      desc: 'صلِّ الظهر في وقته', points: 15, category: 'prayer' },
  { id: 'asr',      icon: '🌤', title: 'صلاة العصر',      desc: 'صلِّ العصر في وقته', points: 15, category: 'prayer' },
  { id: 'maghrib',  icon: '🌇', title: 'صلاة المغرب',     desc: 'صلِّ المغرب في وقته', points: 15, category: 'prayer' },
  { id: 'isha',     icon: '🌙', title: 'صلاة العشاء',     desc: 'صلِّ العشاء في وقته', points: 15, category: 'prayer' },
  { id: 'morning',  icon: '🌅', title: 'أذكار الصباح',    desc: 'قل أذكار الصباح كاملة', points: 10, category: 'azkar' },
  { id: 'evening',  icon: '🌆', title: 'أذكار المساء',    desc: 'قل أذكار المساء كاملة', points: 10, category: 'azkar' },
  { id: 'quran',    icon: '📖', title: 'قراءة القرآن',    desc: 'اقرأ ورداً من القرآن', points: 15, category: 'quran' },
  { id: 'duha',     icon: '✨', title: 'صلاة الضحى',      desc: 'صلِّ ركعتين الضحى', points: 10, category: 'sunnah' },
  { id: 'istighfar',icon: '🤲', title: 'الاستغفار ١٠٠',   desc: 'استغفر الله ١٠٠ مرة', points: 10, category: 'azkar' },
  { id: 'salah',    icon: '💚', title: 'الصلاة على النبي', desc: 'صلِّ على النبي ﷺ ١٠ مرات', points: 5, category: 'azkar' },
  { id: 'sadaqa',   icon: '💝', title: 'صدقة اليوم',      desc: 'تصدّق ولو بالقليل', points: 10, category: 'sunnah' },
  ...(isJumaa ? [
    { id: 'kahf', icon: '📗', title: 'سورة الكهف', desc: 'اقرأ سورة الكهف اليوم (الجمعة)', points: 20, category: 'quran' },
  ] : []),
]

const COLORS = { prayer: '#6bc077', azkar: '#5b8dee', quran: '#f3a049', sunnah: '#a779e9' }
const LABELS = { prayer: 'صلاة', azkar: 'أذكار', quran: 'قرآن', sunnah: 'سنة' }

export default function DailyChallenge() {
  const [done, setDone] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('challenge_' + TODAY) || '{}')
      return saved
    } catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem('challenge_' + TODAY, JSON.stringify(done))
  }, [done])

  const toggle = (id) => setDone(prev => ({ ...prev, [id]: !prev[id] }))

  const totalPoints = ALL_TASKS.reduce((s, t) => s + (done[t.id] ? t.points : 0), 0)
  const maxPoints = ALL_TASKS.reduce((s, t) => s + t.points, 0)
  const pct = Math.round((totalPoints / maxPoints) * 100)

  const grade = pct === 100 ? { label: 'ممتاز 🏆', color: '#6bc077' }
    : pct >= 80 ? { label: 'رائع 🌟', color: '#f3a049' }
    : pct >= 50 ? { label: 'جيد 💪', color: '#5b8dee' }
    : { label: 'استمر 🤲', color: '#a779e9' }

  const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🎯 تحدي اليوم</h1>
        <p>{today}</p>
      </div>

      {/* progress */}
      <div className="challenge-score">
        <div className="challenge-score-top">
          <span className="challenge-pts">{totalPoints} <small>نقطة</small></span>
          <span className="challenge-grade" style={{ color: grade.color }}>{grade.label}</span>
        </div>
        <div className="challenge-bar-bg">
          <div className="challenge-bar-fill" style={{ width: pct + '%', background: grade.color }} />
        </div>
        <div className="challenge-bar-label">{pct}% مكتمل — {ALL_TASKS.filter(t => done[t.id]).length} من {ALL_TASKS.length} مهمة</div>
      </div>

      {/* tasks */}
      <div className="challenge-list">
        {ALL_TASKS.map(task => (
          <div
            key={task.id}
            className={`challenge-item ${done[task.id] ? 'done' : ''}`}
            onClick={() => toggle(task.id)}
          >
            <div className="challenge-check" style={{ borderColor: done[task.id] ? COLORS[task.category] : 'var(--border)' }}>
              {done[task.id] && <span style={{ color: COLORS[task.category] }}>✓</span>}
            </div>
            <span className="challenge-icon">{task.icon}</span>
            <div className="challenge-info">
              <span className="challenge-title">{task.title}</span>
              <span className="challenge-desc">{task.desc}</span>
            </div>
            <div className="challenge-right">
              <span className="challenge-cat" style={{ color: COLORS[task.category] }}>{LABELS[task.category]}</span>
              <span className="challenge-pts-badge">+{task.points}</span>
            </div>
          </div>
        ))}
      </div>

      {pct === 100 && (
        <div className="challenge-congrats">
          🏆 أحسنت! أكملت تحدي اليوم. جزاك الله خيرًا وكتب لك الأجر.
        </div>
      )}
    </div>
  )
}
