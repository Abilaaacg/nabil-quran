import React, { useState, useRef, useEffect } from 'react'
import './Tasbeeh.css'

const PRESETS = [
  { name: 'سبحان الله', target: 33 },
  { name: 'الحمد لله', target: 33 },
  { name: 'الله أكبر', target: 34 },
  { name: 'لا إله إلا الله', target: 100 },
  { name: 'أستغفر الله', target: 100 },
  { name: 'اللهم صل على محمد', target: 100 },
]

const STORAGE_KEY = 'tasbeeh_total'

export default function Tasbeeh() {
  const [count, setCount] = useState(0)
  const [preset, setPreset] = useState(0)
  const [total, setTotal] = useState(() => parseInt(localStorage.getItem(STORAGE_KEY) || '0'))
  const [done, setDone] = useState(false)
  const [pulse, setPulse] = useState(false)
  const timer = useRef(null)

  const target = PRESETS[preset].target
  const progress = Math.min(count / target, 1)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, String(total)) }, [total])
  useEffect(() => () => clearTimeout(timer.current), [])

  function tap() {
    if (done) return
    const next = count + 1
    setCount(next)
    setTotal(t => t + 1)
    setPulse(true)
    setTimeout(() => setPulse(false), 150)
    if (navigator.vibrate) navigator.vibrate(20)
    if (next >= target) {
      if (navigator.vibrate) navigator.vibrate([50, 30, 50])
      setDone(true)
      timer.current = setTimeout(() => { setCount(0); setDone(false) }, 1200)
    }
  }

  function reset() { clearTimeout(timer.current); setCount(0); setDone(false) }
  function pick(i) { setPreset(i); setCount(0); setDone(false); clearTimeout(timer.current) }

  return (
    <div className="page-container fade-in tasbeeh-page">
      {/* الأذكار */}
      <div className="tb-presets">
        {PRESETS.map((p, i) => (
          <button key={i} className={`tb-pill${preset === i ? ' active' : ''}`} onClick={() => pick(i)}>
            {p.name}
          </button>
        ))}
      </div>

      {/* اسم الذكر */}
      <div className="tb-name">{PRESETS[preset].name}</div>

      {/* الزر الرئيسي */}
      <button className={`tb-btn${pulse ? ' pulse' : ''}${done ? ' done' : ''}`} onClick={tap}>
        <svg className="tb-ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeWidth="4"
            strokeDasharray={289} strokeDashoffset={289 * (1 - progress)}
            strokeLinecap="round" transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.2s' }} />
        </svg>
        <span className="tb-count">{done ? '✓' : count}</span>
      </button>

      {/* العداد */}
      <div className="tb-info">
        <span className="tb-fraction">{count} / {target}</span>
        <button className="tb-reset" onClick={reset}>↺</button>
      </div>

      {/* الإجمالي */}
      <div className="tb-total">
        <span>الإجمالي: {total.toLocaleString('ar-EG')}</span>
        <button className="tb-total-clear" onClick={() => setTotal(0)}>مسح</button>
      </div>
    </div>
  )
}
