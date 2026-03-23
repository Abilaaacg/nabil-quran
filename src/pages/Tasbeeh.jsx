import React, { useState, useRef, useEffect } from 'react'
import './Tasbeeh.css'

const PRESETS = [
  { name: 'سبحان الله',           target: 33  },
  { name: 'الحمد لله',            target: 33  },
  { name: 'الله أكبر',            target: 34  },
  { name: 'لا إله إلا الله',      target: 100 },
  { name: 'سبحان الله وبحمده',    target: 100 },
  { name: 'أستغفر الله',          target: 100 },
  { name: 'اللهم صل على محمد',    target: 100 },
]

const STORAGE_KEY = 'tasbeeh_total'

function playTickBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08)
  } catch (_) {}
}

function playCompletionBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5)
  } catch (_) {}
}

export default function Tasbeeh() {
  const [count, setCount]               = useState(0)
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [totalCount, setTotalCount]     = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parseInt(stored, 10) : 0
  })
  const [completed, setCompleted]       = useState(false)
  const [customTarget, setCustomTarget] = useState('')
  const [useCustom, setUseCustom]       = useState(false)
  const [pulsing, setPulsing]           = useState(false)
  const resetTimerRef = useRef(null)

  const target = useCustom && customTarget !== ''
    ? Math.max(1, parseInt(customTarget, 10) || 1)
    : PRESETS[selectedPreset].target

  const safeCount  = isNaN(count) ? 0 : count
  const safeTarget = isNaN(target) || target <= 0 ? 1 : target
  const progress   = Math.min(safeCount / safeTarget, 1)
  const RADIUS = 90
  const CIRC   = 2 * Math.PI * RADIUS
  const offset = CIRC * (1 - progress)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, String(totalCount)) }, [totalCount])
  useEffect(() => () => clearTimeout(resetTimerRef.current), [])

  function handleTap() {
    if (completed) return
    const next = count + 1
    setCount(next)
    setTotalCount(t => t + 1)
    setPulsing(true)
    setTimeout(() => setPulsing(false), 200)
    if (navigator.vibrate) navigator.vibrate(30)
    playTickBeep()
    if (next >= target) {
      playCompletionBeep()
      if (navigator.vibrate) navigator.vibrate([60, 30, 60, 30, 120])
      setCompleted(true)
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => { setCount(0); setCompleted(false) }, 1500)
    }
  }

  function handleReset() { clearTimeout(resetTimerRef.current); setCount(0); setCompleted(false) }
  function handleResetTotal() { setTotalCount(0) }

  function handlePresetSelect(idx) {
    setSelectedPreset(idx); setUseCustom(false)
    setCount(0); setCompleted(false); clearTimeout(resetTimerRef.current)
  }

  function handleCustomTargetChange(e) {
    setCustomTarget(e.target.value); setUseCustom(true)
    setCount(0); setCompleted(false); clearTimeout(resetTimerRef.current)
  }

  const presetName = useCustom ? 'تسبيح مخصص' : PRESETS[selectedPreset].name

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>📿 عداد التسبيح</h1>
        <p>سبّح واذكر الله</p>
      </div>

      {/* أقراص الأذكار */}
      <div className="tasbeeh-presets">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            className={`tasbeeh-pill${selectedPreset === i && !useCustom ? ' active' : ''}`}
            onClick={() => handlePresetSelect(i)}
          >
            {p.name} <span className="pill-target">{p.target}</span>
          </button>
        ))}
      </div>

      {/* بطاقة العداد الرئيسية */}
      <div className="tasbeeh-main-card card">
        <div className="tasbeeh-dhikr-name">{presetName}</div>

        <div className="tasbeeh-ring-wrapper">
          <svg className="tasbeeh-progress-svg" viewBox="0 0 220 220">
            <circle className="ring-track" cx="110" cy="110" r={RADIUS} fill="none" strokeWidth="8" />
            <circle className="ring-progress" cx="110" cy="110" r={RADIUS} fill="none" strokeWidth="8"
              strokeDasharray={CIRC} strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 110 110)" />
          </svg>
          <button
            className={`tasbeeh-tap-btn${pulsing ? ' pulse' : ''}${completed ? ' completed' : ''}`}
            onClick={handleTap}
          >
            {completed
              ? <span className="completed-label">اكتمل! 🎉</span>
              : <span className="tap-count">{safeCount}</span>
            }
          </button>
        </div>

        <div className="tasbeeh-fraction">
          <span className="fraction-current">{safeCount}</span>
          <span className="fraction-sep">/</span>
          <span className="fraction-target">{safeTarget}</span>
        </div>

        <button className="tasbeeh-reset-btn" onClick={handleReset}>↺ إعادة العد</button>
      </div>

      {/* هدف مخصص */}
      <div className="tasbeeh-custom-card card">
        <label className="custom-label">🎯 هدف مخصص</label>
        <input
          type="number"
          className={`custom-input${useCustom ? ' active' : ''}`}
          placeholder="اكتب العدد المطلوب..."
          value={customTarget}
          min="1"
          onChange={handleCustomTargetChange}
          onFocus={() => { if (customTarget) setUseCustom(true) }}
        />
      </div>

      {/* إجمالي التسبيح */}
      <div className="tasbeeh-total-card card">
        <div className="total-info">
          <div className="total-label">📊 إجمالي التسبيح</div>
          <div className="total-number">{totalCount.toLocaleString('ar-EG')}</div>
        </div>
        <button className="total-reset-btn" onClick={handleResetTotal}>مسح</button>
      </div>
    </div>
  )
}
