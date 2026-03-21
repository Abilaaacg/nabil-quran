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

function playCompletionBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch (_) {
    // AudioContext not available (e.g. SSR), silently ignore
  }
}

function playTickBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch (_) {}
}

export default function Tasbeeh() {
  const [count, setCount]               = useState(0)
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [totalCount, setTotalCount]     = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parseInt(stored, 10) : 0
  })
  const [vibrating, setVibrating]       = useState(false)
  const [completed, setCompleted]       = useState(false)
  const [customTarget, setCustomTarget] = useState('')
  const [useCustom, setUseCustom]       = useState(false)
  const [pulsing, setPulsing]           = useState(false)

  const resetTimerRef = useRef(null)

  const target = useCustom && customTarget !== ''
    ? Math.max(1, parseInt(customTarget, 10) || 1)
    : PRESETS[selectedPreset].target

  const safeCount   = isNaN(count) ? 0 : count
  const safeTarget  = isNaN(target) || target <= 0 ? 1 : target
  const progress    = Math.min(safeCount / safeTarget, 1)

  // SVG progress ring
  const RADIUS      = 90
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const strokeOffset  = CIRCUMFERENCE * (1 - progress)

  // Persist total to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(totalCount))
  }, [totalCount])

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(resetTimerRef.current), [])

  function handleTap() {
    if (completed) return

    const next = count + 1
    setCount(next)
    setTotalCount(t => t + 1)

    // Pulse animation
    setPulsing(true)
    setTimeout(() => setPulsing(false), 200)

    // Haptic feedback (Capacitor / mobile)
    if (navigator.vibrate) navigator.vibrate(30)
    setVibrating(true)
    setTimeout(() => setVibrating(false), 150)

    playTickBeep()

    if (next >= target) {
      playCompletionBeep()
      if (navigator.vibrate) navigator.vibrate([60, 30, 60, 30, 120])
      setCompleted(true)
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => {
        setCount(0)
        setCompleted(false)
      }, 1500)
    }
  }

  function handleReset() {
    clearTimeout(resetTimerRef.current)
    setCount(0)
    setCompleted(false)
  }

  function handleResetTotal() {
    setTotalCount(0)
  }

  function handlePresetSelect(idx) {
    setSelectedPreset(idx)
    setUseCustom(false)
    setCount(0)
    setCompleted(false)
    clearTimeout(resetTimerRef.current)
  }

  function handleCustomTargetChange(e) {
    setCustomTarget(e.target.value)
    setUseCustom(true)
    setCount(0)
    setCompleted(false)
    clearTimeout(resetTimerRef.current)
  }

  const presetName = useCustom ? 'مخصص' : PRESETS[selectedPreset].name

  return (
    <div className="page-container fade-in tasbeeh-page">
      {/* Header */}
      <div className="page-header">
        <h1>المسبحة</h1>
        <p>عدّاد التسبيح الرقمي</p>
      </div>

      {/* Preset pills */}
      <div className="tasbeeh-presets">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            className={`tasbeeh-pill${selectedPreset === i && !useCustom ? ' active' : ''}`}
            onClick={() => handlePresetSelect(i)}
          >
            {p.name}
            <span className="pill-target">{p.target}</span>
          </button>
        ))}
      </div>

      {/* Custom target */}
      <div className="tasbeeh-custom">
        <label className="custom-label">هدف مخصص:</label>
        <input
          type="number"
          className={`custom-input${useCustom ? ' active' : ''}`}
          placeholder="أدخل العدد"
          value={customTarget}
          min="1"
          onChange={handleCustomTargetChange}
          onFocus={() => { if (customTarget) setUseCustom(true) }}
        />
      </div>

      {/* Preset name display */}
      <div className="tasbeeh-dhikr-name">{presetName}</div>

      {/* Progress ring + tap button */}
      <div className="tasbeeh-ring-wrapper">
        <svg
          className="tasbeeh-progress-svg"
          viewBox="0 0 220 220"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Track */}
          <circle
            className="ring-track"
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            className="ring-progress"
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
          />
        </svg>

        {/* Tap button */}
        <button
          className={`tasbeeh-tap-btn${pulsing ? ' pulse' : ''}${completed ? ' completed' : ''}`}
          onClick={handleTap}
          aria-label="تسبيح"
        >
          {completed
            ? <span className="completed-label">اكتمل!&nbsp;🎉</span>
            : <span className="tap-count">{safeCount}</span>
          }
        </button>
      </div>

      {/* Progress fraction */}
      <div className="tasbeeh-fraction">
        <span className="fraction-current">{safeCount}</span>
        <span className="fraction-sep">/</span>
        <span className="fraction-target">{safeTarget}</span>
      </div>

      {/* Action buttons */}
      <div className="tasbeeh-actions">
        <button className="tasbeeh-reset-btn" onClick={handleReset}>
          إعادة تعيين
        </button>
      </div>

      {/* Lifetime total */}
      <div className="tasbeeh-total-card">
        <div className="total-label">إجمالي التسبيح</div>
        <div className="total-number">{totalCount.toLocaleString('ar-EG')}</div>
        <button className="total-reset-btn" onClick={handleResetTotal}>
          مسح الكل
        </button>
      </div>
    </div>
  )
}
