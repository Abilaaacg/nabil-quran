import { useApp } from '../context/AppContext'

export default function TopBar() {
  const { theme, toggleTheme } = useApp()

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <span>☪️</span>
        <span>نور الإسلام</span>
      </div>
      <button className="topbar-theme-btn" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
