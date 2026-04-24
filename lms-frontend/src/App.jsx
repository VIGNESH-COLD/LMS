import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import StudentDashboard from './pages/StudentDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CoursePage from './pages/CoursePage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><DashboardLayout><StudentDashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/instructor" element={<ProtectedRoute roles={['INSTRUCTOR']}><DashboardLayout><InstructorDashboard /></DashboardLayout></ProtectedRoute>} />
        
        <Route path="/course/:id" element={<ProtectedRoute><DashboardLayout><CoursePage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/quiz/:id" element={<ProtectedRoute roles={['STUDENT']}><DashboardLayout><QuizPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><DashboardLayout><ResultsPage /></DashboardLayout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}
