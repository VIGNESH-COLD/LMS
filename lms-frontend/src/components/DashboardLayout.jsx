import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Chatbot from './Chatbot'

import { LayoutDashboard, User, BookOpen, FileEdit, Trophy, Target, Megaphone, Calendar, Lock, Building2, Users, LineChart, BookMarked, ClipboardList } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) setIsSidebarOpen(false)
      else setIsSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!user) return children

  const getMenuItems = () => {
    if (user.role === 'STUDENT') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/student', category: 'MAIN' },
        { id: 'studentdetails', label: 'Student Detail', icon: <User className="w-4 h-4" />, path: '/student?tab=profile', category: 'MENU' },
        { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" />, path: '/student?tab=courses', category: 'MENU' },
        { id: 'internalmarks', label: 'Internal Marks', icon: <FileEdit className="w-4 h-4" />, path: '/student?tab=marks', category: 'MENU' },
        { id: 'achievement', label: 'Achievements', icon: <Trophy className="w-4 h-4" />, path: '/student?tab=achievements', category: 'MENU' },
        { id: 'events', label: 'Events', icon: <Target className="w-4 h-4" />, path: '/student?tab=events', category: 'MENU' },
        { id: 'announcement', label: 'Announcements', icon: <Megaphone className="w-4 h-4" />, path: '/student?tab=events', category: 'MENU' },
        { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-4 h-4" />, path: '/student?tab=timetable', category: 'MENU' },
        { id: 'settings', label: 'Change Password', icon: <Lock className="w-4 h-4" />, path: '/student?tab=settings', category: 'SETTINGS' },
      ]
    }

    if (user.role === 'INSTRUCTOR') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/instructor', category: 'MAIN' },
        { id: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" />, path: '/instructor?tab=courses', category: 'MENU' },
        { id: 'marks', label: 'Internal Marks', icon: <FileEdit className="w-4 h-4" />, path: '/instructor?tab=marks', category: 'MENU' },
        { id: 'studymaterials', label: 'Study Materials', icon: <BookMarked className="w-4 h-4" />, path: '/instructor?tab=materials', category: 'MENU' },
        { id: 'syllabus', label: 'Syllabus', icon: <ClipboardList className="w-4 h-4" />, path: '/instructor?tab=syllabus', category: 'MENU' },
        { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-4 h-4" />, path: '/instructor?tab=timetable', category: 'MENU' },
        { id: 'settings', label: 'Change Password', icon: <Lock className="w-4 h-4" />, path: '/instructor?tab=settings', category: 'SETTINGS' },
      ]
    }

    if (user.role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/admin', category: 'MAIN' },
        { id: 'departments', label: 'Class / Department', icon: <Building2 className="w-4 h-4" />, path: '/admin?tab=departments', category: 'MENU' },
        { id: 'faculty', label: 'Faculty', icon: <Users className="w-4 h-4" />, path: '/admin?tab=faculty', category: 'MENU' },
        { id: 'students', label: 'Students', icon: <User className="w-4 h-4" />, path: '/admin?tab=students', category: 'MENU' },
        { id: 'timetable', label: 'Plan Timetable', icon: <Calendar className="w-4 h-4" />, path: '/admin?tab=timetable', category: 'MENU' },
        { id: 'tracking', label: 'Tracking System', icon: <LineChart className="w-4 h-4" />, path: '/admin?tab=tracking', category: 'MENU' },
        { id: 'settings', label: 'Change Password', icon: <Lock className="w-4 h-4" />, path: '/admin?tab=settings', category: 'SETTINGS' },
      ]
    }

    return []
  }

  const menuItems = getMenuItems()
  const categories = ['MAIN', 'MENU', 'SETTINGS']

  return (
    <div className="flex min-h-screen overflow-x-hidden relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      {/* Sidebar */}
      <aside className={`sidebar transition-all duration-300 shadow-2xl z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-white/20">
              <img src="/logo.png" alt="RIT Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white uppercase tracking-wider">
                Rajalakshmi
              </h1>
              <p className="text-[10px] text-gray-400">INSTITUTE OF TECHNOLOGY</p>
            </div>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#1F232B]/50 border-none rounded-md py-2 px-9 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
            {categories.map((cat) => {
              const catItems = menuItems.filter(i => i.category === cat)
              if (catItems.length === 0) return null
              
              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center">
                     <span className="w-2 h-[1px] bg-gray-700 mr-2"></span>
                     {cat}
                  </div>
                  {catItems.map((item) => {
                    const isActive = location.pathname + location.search === item.path || (item.id === 'dashboard' && location.pathname === item.path);
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth <= 1024) setIsSidebarOpen(false)
                        }}
                        className={`sidebar-item text-sm group ${isActive ? 'active' : ''}`}
                      >
                        <span className="transform group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center justify-between text-[#A8ABAF] hover:text-white transition-colors text-sm w-full p-2 rounded-lg hover:bg-white/5"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`dashboard-main flex-1 flex flex-col pt-0 w-full transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Toggle Header */}
        <header className="bg-white/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10 px-3 sm:px-6 py-3 flex items-center sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 -ml-2 mr-4 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5 transition-transform duration-300" style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize flex items-center space-x-2">
            <span className="opacity-50">{user.role}</span>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <span className="text-blue-600 dark:text-blue-400">{location.pathname.replace('/', '') || 'Portal'}</span>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <svg className="w-5 h-5 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 118.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-100 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                {user.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="px-3 sm:px-8 py-3 sm:py-4 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-gray-500">
          <span className="tracking-wide text-gray-400">&copy; 2026 RAJALAKSHMI INSTITUTE OF TECHNOLOGY.</span>
          <div className="flex items-center space-x-2">
             <div className="w-4 h-4 rounded-sm overflow-hidden flex-shrink-0">
               <img src="/logo.png" alt="RIT" className="w-full h-full object-cover" />
             </div>
             <span className="font-bold tracking-tighter text-blue-600 dark:text-blue-400">RIT-IMS VER 2.0</span>
          </div>
        </footer>
      </main>

      {/* Global Chatbot */}
      <Chatbot />
    </div>
  )
}
