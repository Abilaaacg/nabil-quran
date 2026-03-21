import { useNavigate, useLocation } from 'react-router-dom'
import './ChatFAB.css'

export default function ChatFAB() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/ai') return null

  return (
    <button className="chat-fab" onClick={() => navigate('/ai')} title="المساعد الشخصي">
      <span className="chat-fab-pulse" />
      <span className="chat-fab-icon">🌙</span>
      <span className="chat-fab-label">مساعدك الشخصي</span>
    </button>
  )
}
