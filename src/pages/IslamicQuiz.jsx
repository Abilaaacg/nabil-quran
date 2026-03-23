import { useState, useEffect } from 'react'
import './IslamicQuiz.css'

const QUESTIONS = [
  { q: 'كم عدد سور القرآن الكريم؟', opts: ['112', '114', '120', '110'], correct: 1 },
  { q: 'ما أطول سورة في القرآن؟', opts: ['آل عمران', 'النساء', 'البقرة', 'المائدة'], correct: 2 },
  { q: 'ما أقصر سورة في القرآن؟', opts: ['الإخلاص', 'الفلق', 'الكوثر', 'الناس'], correct: 2 },
  { q: 'كم عدد أركان الإسلام؟', opts: ['4', '5', '6', '7'], correct: 1 },
  { q: 'ما أول ما نزل من القرآن؟', opts: ['الفاتحة', 'البقرة', 'اقرأ', 'المدثر'], correct: 2 },
  { q: 'في أي شهر نزل القرآن؟', opts: ['شعبان', 'رجب', 'رمضان', 'محرم'], correct: 2 },
  { q: 'كم عدد أركان الإيمان؟', opts: ['5', '6', '7', '4'], correct: 1 },
  { q: 'ما اسم أم النبي ﷺ؟', opts: ['خديجة', 'آمنة', 'فاطمة', 'عائشة'], correct: 1 },
  { q: 'أين ولد النبي ﷺ؟', opts: ['المدينة', 'الطائف', 'مكة', 'القدس'], correct: 2 },
  { q: 'كم عدد الصلوات المفروضة؟', opts: ['3', '4', '5', '7'], correct: 2 },
  { q: 'ما أول مسجد بُني في الإسلام؟', opts: ['المسجد النبوي', 'المسجد الحرام', 'مسجد قباء', 'المسجد الأقصى'], correct: 2 },
  { q: 'كم سنة استمرت الدعوة السرية؟', opts: ['سنة', 'سنتين', '3 سنوات', '5 سنوات'], correct: 2 },
  { q: 'ما هي السورة التي تعدل ثلث القرآن؟', opts: ['الفاتحة', 'الإخلاص', 'يس', 'الملك'], correct: 1 },
  { q: 'كم عام عاش النبي ﷺ؟', opts: ['60', '63', '65', '70'], correct: 1 },
  { q: 'ما هو الركن الخامس من أركان الإسلام؟', opts: ['الصيام', 'الزكاة', 'الحج', 'الصلاة'], correct: 2 },
  { q: 'من أول من أسلم من الرجال؟', opts: ['عمر بن الخطاب', 'أبو بكر الصديق', 'علي بن أبي طالب', 'عثمان بن عفان'], correct: 1 },
  { q: 'كم عدد أبواب الجنة؟', opts: ['7', '8', '9', '10'], correct: 1 },
  { q: 'ما هي الصلاة الوسطى؟', opts: ['الظهر', 'العصر', 'المغرب', 'الفجر'], correct: 1 },
  { q: 'من هو خاتم الأنبياء؟', opts: ['إبراهيم', 'موسى', 'عيسى', 'محمد ﷺ'], correct: 3 },
  { q: 'ما أول سورة نزلت كاملة؟', opts: ['الفاتحة', 'المدثر', 'العلق', 'المسد'], correct: 0 },
  { q: 'كم مرة ذُكر اسم محمد في القرآن؟', opts: ['3', '4', '5', '7'], correct: 1 },
  { q: 'ما هي ليلة القدر؟', opts: ['أول ليلة في رمضان', 'ليلة 15 رمضان', 'في العشر الأواخر', 'ليلة العيد'], correct: 2 },
  { q: 'كم عدد الأنبياء المذكورين في القرآن؟', opts: ['20', '25', '30', '33'], correct: 1 },
  { q: 'ما هي السورة التي بدأت بـ "طه"؟', opts: ['مريم', 'طه', 'يس', 'ص'], correct: 1 },
  { q: 'من بنى الكعبة؟', opts: ['محمد ﷺ', 'إبراهيم وإسماعيل', 'نوح', 'آدم'], correct: 1 },
  { q: 'ما اسم ناقة النبي صالح؟', opts: ['القصواء', 'العضباء', 'ناقة الله', 'البراق'], correct: 2 },
  { q: 'كم عدد السجدات في القرآن؟', opts: ['14', '15', '13', '16'], correct: 1 },
  { q: 'ما هو يوم عرفة؟', opts: ['8 ذو الحجة', '9 ذو الحجة', '10 ذو الحجة', '1 محرم'], correct: 1 },
  { q: 'من هو كليم الله؟', opts: ['إبراهيم', 'عيسى', 'موسى', 'محمد ﷺ'], correct: 2 },
  { q: 'ما أطول آية في القرآن؟', opts: ['آية الكرسي', 'آية الدَّين', 'آية النور', 'آية المباهلة'], correct: 1 },
]

const LEVELS = [
  { name: 'مبتدئ', min: 0, color: '#6bc077' },
  { name: 'متوسط', min: 10, color: '#5b8dee' },
  { name: 'متقدم', min: 20, color: '#f3a049' },
  { name: 'عالم', min: 30, color: '#e96979' },
]

function getLevel(score) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

export default function IslamicQuiz() {
  const [mode, setMode] = useState('menu') // menu | playing | result
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [totalScore, setTotalScore] = useState(() => parseInt(localStorage.getItem('quiz_total') || '0'))
  const [streak, setStreak] = useState(0)
  const [timer, setTimer] = useState(15)

  useEffect(() => { localStorage.setItem('quiz_total', String(totalScore)) }, [totalScore])

  // عداد تنازلي
  useEffect(() => {
    if (mode !== 'playing' || selected !== null) return
    if (timer <= 0) { handleAnswer(-1); return }
    const t = setTimeout(() => setTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timer, mode, selected])

  function startQuiz() {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10)
    setQuestions(shuffled)
    setCurrent(0); setScore(0); setSelected(null); setStreak(0); setTimer(15)
    setMode('playing')
  }

  function handleAnswer(idx) {
    if (selected !== null) return
    setSelected(idx)
    const correct = questions[current].correct
    if (idx === correct) {
      const pts = timer > 10 ? 3 : timer > 5 ? 2 : 1
      setScore(s => s + pts)
      setTotalScore(s => s + pts)
      setStreak(s => s + 1)
    } else {
      setStreak(0)
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setMode('result')
      } else {
        setCurrent(c => c + 1); setSelected(null); setTimer(15)
      }
    }, 1200)
  }

  if (mode === 'menu') {
    const level = getLevel(totalScore)
    return (
      <div className="page-container fade-in">
        <div className="page-header"><h1>🏆 المسابقة الإسلامية</h1><p>اختبر معلوماتك الدينية</p></div>
        <div className="quiz-stats card">
          <div className="quiz-stat"><span className="quiz-stat-num">{totalScore}</span><span>نقطة</span></div>
          <div className="quiz-stat"><span className="quiz-stat-num" style={{ color: level.color }}>{level.name}</span><span>المستوى</span></div>
        </div>
        <button className="quiz-start-btn" onClick={startQuiz}>🎯 ابدأ المسابقة (10 أسئلة)</button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>أجب بسرعة عشان تاخد نقاط أكتر!</p>
      </div>
    )
  }

  if (mode === 'result') {
    const level = getLevel(totalScore)
    return (
      <div className="page-container fade-in">
        <div className="page-header"><h1>🎉 النتيجة</h1></div>
        <div className="quiz-result card">
          <div className="quiz-result-score">{score}</div>
          <div className="quiz-result-label">نقطة من 30</div>
          <div className="quiz-result-level" style={{ color: level.color }}>المستوى: {level.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>الإجمالي: {totalScore} نقطة</div>
        </div>
        <button className="quiz-start-btn" onClick={startQuiz}>🔄 العب مرة تانية</button>
        <button className="quiz-back-btn" onClick={() => setMode('menu')}>← رجوع</button>
      </div>
    )
  }

  const q = questions[current]
  const correct = q.correct

  return (
    <div className="page-container fade-in">
      <div className="quiz-header">
        <span className="quiz-progress">{current + 1}/{questions.length}</span>
        <span className="quiz-timer" style={{ color: timer <= 5 ? '#e96979' : 'var(--accent)' }}>{timer}⏱</span>
        <span className="quiz-score-live">🔥 {score}</span>
      </div>
      {streak >= 3 && <div className="quiz-streak">🔥 سلسلة {streak} إجابات صحيحة!</div>}
      <div className="quiz-question card">{q.q}</div>
      <div className="quiz-options">
        {q.opts.map((opt, i) => (
          <button
            key={i}
            className={`quiz-opt ${selected !== null ? (i === correct ? 'correct' : i === selected ? 'wrong' : '') : ''}`}
            onClick={() => handleAnswer(i)}
            disabled={selected !== null}
          >{opt}</button>
        ))}
      </div>
    </div>
  )
}
