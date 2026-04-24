import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = sessionStorage.getItem('lms_token') || localStorage.getItem('lms_token')
    const savedUser = sessionStorage.getItem('lms_user') || localStorage.getItem('lms_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      // Refresh user profile from server to get latest data
      authAPI.getMe()
        .then(res => {
          const fresh = {
            id: res.data.userId,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
            department: res.data.department,
            section: res.data.section,
            rollNumber: res.data.rollNumber,
            year: res.data.year,
            semester: res.data.semester,
            phoneNumber: res.data.phoneNumber,
          }
          setUser(fresh)
          sessionStorage.setItem('lms_user', JSON.stringify(fresh))
        })
        .catch(() => {/* keep existing user if refresh fails */})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (authResponse) => {
    setToken(authResponse.token)
    const userData = {
      id: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
      department: authResponse.department,
      section: authResponse.section,
      rollNumber: authResponse.rollNumber,
      year: authResponse.year,
      semester: authResponse.semester,
      phoneNumber: authResponse.phoneNumber,
    }
    setUser(userData)
    sessionStorage.setItem('lms_token', authResponse.token)
    sessionStorage.setItem('lms_user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem('lms_token')
    sessionStorage.removeItem('lms_user')
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
  }

  const isInstructor = user?.role === 'INSTRUCTOR'
  const isStudent = user?.role === 'STUDENT'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isInstructor, isStudent, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

