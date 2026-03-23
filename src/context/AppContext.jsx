import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nq-settings')) || {
        quranFontSize: 30,
        adhkarFontSize: 20,
        location: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        calcMethod: 'Egyptian',
        audioVolume: 80,
        adhanEnabled: true,
        adhanSound: 'makkah',
        salawatEnabled: false,
        salawatInterval: 30,
        notifMinutesBefore: 5,
      }
    } catch {
      return {
        quranFontSize: 30,
        adhkarFontSize: 20,
        location: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        calcMethod: 4,
        audioVolume: 80,
        adhanEnabled: true,
        adhanSound: 'makkah',
        salawatEnabled: false,
        salawatInterval: 30,
        notifMinutesBefore: 5,
      }
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('nq-settings', JSON.stringify(settings))
  }, [settings])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  return (
    <AppContext.Provider value={{ theme, toggleTheme, settings, updateSettings }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
