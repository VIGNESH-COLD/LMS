import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { submissionAPI, analyticsAPI } from '../services/api'

export default function ResultsPage() {
  const { user, isInstructor, isStudent } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadResults() }, [])

  const loadResults = async () => {
    try {
      if (isStudent) {
        const [subRes, anaRes] = await Promise.all([
          submissionAPI.getMySubmissions(),
          analyticsAPI.getStudentAnalytics(),
        ])
        setSubmissions(subRes.data)
        setAnalytics(anaRes.data)
      } else if (isInstructor) {
        const anaRes = await analyticsAPI.getInstructorAnalytics()
        setAnalytics(anaRes.data)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>

  const filteredSubs = filter === 'all' ? submissions
    : filter === 'quiz' ? submissions.filter(s => s.quizId)
    : submissions.filter(s => s.assignmentId)

  const graded = submissions.filter(s => s.graded)
  const totalScore = graded.reduce((sum, s) => sum + (s.score || 0), 0)
  const totalMarks = graded.reduce((sum, s) => sum + (s.totalMarks || 0), 0)
  const overallPct = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-heading">Results & Analytics 📊</h1>
        <p className="text-sub mt-1">Track your performance across all assessments</p>
      </div>

      {/* Overview Stats */}
      {isStudent && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <div className="stat-card">
            <div className="stat-value">{overallPct}%</div>
            <div className="stat-label">Overall Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{submissions.filter(s => s.quizId).length}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{submissions.filter(s => s.assignmentId).length}</div>
            <div className="stat-label">Assignments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{graded.length}</div>
            <div className="stat-label">Graded</div>
          </div>
        </div>
      )}

      {isInstructor && analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 animate-slide-up">
          <div className="stat-card"><div className="stat-value">{analytics.totalCourses}</div><div className="stat-label">Courses</div></div>
          <div className="stat-card"><div className="stat-value">{analytics.totalStudents}</div><div className="stat-label">Students</div></div>
          <div className="stat-card"><div className="stat-value">{analytics.totalQuizzes}</div><div className="stat-label">Quizzes</div></div>
          <div className="stat-card"><div className="stat-value">{analytics.totalAssignments}</div><div className="stat-label">Assignments</div></div>
          <div className="stat-card"><div className="stat-value">{analytics.averageScore}%</div><div className="stat-label">Avg Score</div></div>
        </div>
      )}

      {/* Performance Bar Chart */}
      {isStudent && graded.length > 0 && (
        <div className="glass-card p-6 mb-8 animate-slide-up" style={{animationDelay:'0.1s'}}>
          <h2 className="text-lg font-semibold text-heading mb-4">Performance Overview</h2>
          <div className="space-y-3">
            {graded.slice(0, 10).map(sub => {
              const pct = sub.totalMarks > 0 ? Math.round((sub.score / sub.totalMarks) * 100) : 0
              return (
                <div key={sub.id} className="flex items-center gap-2 sm:gap-4">
                  <div className="w-24 sm:w-40 truncate text-xs sm:text-sm text-sub flex-shrink-0">
                    {sub.quizTitle || sub.assignmentTitle}
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full h-5 sm:h-6 overflow-hidden min-w-0">
                    <div className={`h-full rounded-full transition-all duration-1000 flex items-center px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-white
                      ${pct >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                        pct >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                        'bg-gradient-to-r from-red-500 to-red-400'}`}
                      style={{width: `${Math.max(pct, 8)}%`}}>
                      {pct}%
                    </div>
                  </div>
                  <div className="w-16 sm:w-20 text-right text-xs sm:text-sm text-sub flex-shrink-0">
                    {sub.score}/{sub.totalMarks}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Instructor Course Analytics */}
      {isInstructor && analytics?.courseAnalytics?.length > 0 && (
        <div className="glass-card overflow-hidden mb-8 animate-slide-up" style={{animationDelay:'0.1s'}}>
          <div className="p-5 border-b border-gray-200 dark:border-white/5">
            <h2 className="text-lg font-semibold text-heading">Course Analytics</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Course</th>
                <th className="text-center text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Students</th>
                <th className="text-center text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Quizzes</th>
                <th className="text-center text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Assignments</th>
                <th className="text-center text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {analytics.courseAnalytics.map(ca => (
                <tr key={ca.courseId} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-heading font-medium">{ca.courseTitle}</td>
                  <td className="px-6 py-4 text-sm text-sub text-center">{ca.enrolledStudents}</td>
                  <td className="px-6 py-4 text-sm text-sub text-center">{ca.quizCount}</td>
                  <td className="px-6 py-4 text-sm text-sub text-center">{ca.assignmentCount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-semibold ${ca.averageQuizScore >= 70 ? 'text-emerald-500 dark:text-emerald-400' : ca.averageQuizScore >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>
                      {ca.averageQuizScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Submissions List (Students) */}
      {isStudent && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title !mb-0">All Submissions</h2>
            <div className="flex space-x-1 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
              {['all', 'quiz', 'assignment'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize
                  ${filter === f ? 'bg-primary-500 text-white' : 'text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-white'}`}>{f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredSubs.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-sub">No submissions yet</p>
              </div>
            ) : filteredSubs.map(sub => (
              <div key={sub.id} className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{sub.quizId ? '📝' : '📋'}</div>
                  <div>
                    <h4 className="font-medium text-heading">{sub.quizTitle || sub.assignmentTitle}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-muted">
                        {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className={sub.quizId ? 'badge-primary' : 'badge-accent'}>
                        {sub.quizId ? 'Quiz' : 'Assignment'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {sub.graded ? (
                    <div>
                      <span className="text-xl font-bold text-primary-500 dark:text-primary-400">{sub.score}</span>
                      <span className="text-sub">/{sub.totalMarks}</span>
                      <div className="text-xs text-muted mt-0.5">
                        {sub.totalMarks > 0 ? Math.round((sub.score / sub.totalMarks) * 100) : 0}%
                      </div>
                    </div>
                  ) : (
                    <span className="badge-warning">Pending Review</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
