import { useState, useRef, useEffect } from 'react'
import './IslamicAI.css'

const SUGGESTIONS = [
  'ما هي أركان الإسلام؟',
  'ما فضل قراءة القرآن؟',
  'ما هي شروط صحة الصلاة؟',
  'ما حكم صيام رمضان؟',
  'ما هي نصاب الزكاة؟',
  'ما فضل الصلاة على النبي ﷺ؟',
  'ما أسباب قبول التوبة؟',
  'ما حكم الغيبة والنميمة؟',
]

const MISTRAL_KEY = '0OuOy44O4MoPxH7FrToFUeDEDaUrYSjz'
const MISTRAL_API = 'https://api.mistral.ai/v1/chat/completions'

const SYSTEM_PROMPT = `أنت مساعد إسلامي ذكي متخصص في العلوم الإسلامية. اسمك "نور" وأنت جزء من تطبيق "نور الإسلام".
مهامك: الإجابة على أسئلة الدين الإسلامي بدقة وأمانة، تفسير الآيات القرآنية والأحاديث النبوية، الفقه والعبادات، العقيدة والسيرة النبوية، الأخلاق والمعاملات الإسلامية، الأذكار والأدعية المأثورة.
قواعد: أجب دائماً باللغة العربية الفصحى الواضحة، استند إلى الكتاب والسنة، إذا لم تعرف قل "الله أعلم"، كن موجزاً ومفيداً.`

export default function IslamicAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'السلام عليكم ورحمة الله وبركاته 🌙\n\nأنا **نور**، مساعدك الإسلامي الذكي. يمكنني الإجابة على أسئلتك في القرآن والسنة والفقه والعقيدة والسيرة النبوية.\n\nاسألني أي شيء في الدين الإسلامي.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setError('')

    const userMsg = { role: 'user', content: q }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    const apiMessages = history
      .filter((_, i) => i > 0)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch(MISTRAL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          max_tokens: 1024,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...apiMessages],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'خطأ في الخدمة')
      const reply = data.choices?.[0]?.message?.content || ''
      setMessages([...history, { role: 'assistant', content: reply }])
    } catch (e) {
      setError('تعذر الاتصال بالمساعد. تحقق من اتصالك بالإنترنت.')
      setMessages(history)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const reset = () => {
    setMessages([{ role: 'assistant', content: 'السلام عليكم ورحمة الله وبركاته 🌙\n\nأنا **نور**، مساعدك الإسلامي الذكي. يمكنني الإجابة على أسئلتك في القرآن والسنة والفقه والعقيدة والسيرة النبوية.\n\nاسألني أي شيء في الدين الإسلامي.' }])
    setInput('')
    setError('')
  }

  return (
    <div className="ai-page">
      {/* رأس الصفحة */}
      <div className="ai-header">
        <div className="ai-header-avatar">🌙</div>
        <div className="ai-header-info">
          <div className="ai-header-name">نور — المساعد الإسلامي</div>
          <div className="ai-header-sub">مدعوم بالذكاء الاصطناعي • يجيب على أسئلة الدين</div>
        </div>
        <button className="ai-reset-btn" onClick={reset} title="محادثة جديدة">↺</button>
      </div>

      {/* نافذة المحادثة */}
      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-bubble-wrap ${m.role}`}>
            {m.role === 'assistant' && <div className="ai-avatar">🌙</div>}
            <div className={`ai-bubble ${m.role}`}>
              <MessageText text={m.content} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-bubble-wrap assistant">
            <div className="ai-avatar">🌙</div>
            <div className="ai-bubble assistant ai-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        {error && (
          <div className="ai-error">{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* اقتراحات */}
      {messages.length <= 1 && !loading && (
        <div className="ai-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="ai-suggestion" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* صندوق الإدخال */}
      <div className="ai-input-area">
        <textarea
          ref={inputRef}
          className="ai-input"
          placeholder="اسألني أي شيء في الدين..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          disabled={loading}
        />
        <button
          className="ai-send-btn"
          onClick={() => send()}
          disabled={!input.trim() || loading}
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  )
}

// تحويل Markdown بسيط للعرض
function MessageText({ text }) {
  const formatted = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />
}
