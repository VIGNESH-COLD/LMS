import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'INSTRUCTOR' ? '/instructor' : '/student'

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b bg-white/80 border-gray-200 dark:bg-surface-950/80 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center
                            group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-surface-300 bg-clip-text text-transparent">
              LMS Pro
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Theme Toggle */}
            <button onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300
                         bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-white/10 dark:hover:bg-white/20 dark:text-surface-300"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <>
                <Link to={dashboardPath} className="text-gray-500 dark:text-surface-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/results" className="text-gray-500 dark:text-surface-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
                  Results
                </Link>
                <div className="flex items-center space-x-3 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-surface-400">{user.role}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="text-sm text-gray-500 dark:text-surface-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/" className="text-gray-500 dark:text-surface-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">Home</Link>
                <Link to="/login" className="btn-primary text-sm !py-2 !px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center space-x-2 md:hidden">
            <button onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-surface-300">
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button className="text-gray-600 dark:text-surface-300 hover:text-gray-900 dark:hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link to={dashboardPath} className="block text-gray-600 dark:text-surface-300 hover:text-gray-900 dark:hover:text-white py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/results" className="block text-gray-600 dark:text-surface-300 hover:text-gray-900 dark:hover:text-white py-2" onClick={() => setMenuOpen(false)}>Results</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-red-500 dark:text-red-400 py-2 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/" className="block text-gray-600 dark:text-surface-300 hover:text-gray-900 dark:hover:text-white py-2" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/login" className="block text-primary-500 dark:text-primary-400 font-semibold py-2" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
