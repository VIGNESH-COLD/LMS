import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return 'light' // Always start in light mode
  })

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    if (theme === 'dark') {
      root.classList.add('dark')
      body.style.backgroundColor = '#020617'
      body.style.color = '#ffffff'
    } else {
      root.classList.remove('dark')
      body.style.backgroundColor = '#f9fafb'
      body.style.color = '#111827'
    }
    localStorage.setItem('lms_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

