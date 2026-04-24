import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { courseAPI, submissionAPI, analyticsAPI, internalMarkAPI, achievementAPI, eventAPI, announcementAPI, timetableAPI, courseMaterialAPI } from '../services/api'
import Calendar from '../components/Calendar'
import ChangePassword from '../components/ChangePassword'
import SharedTimetableTab from '../components/SharedTimetableTab'
import { User, BookOpen, FileEdit, Trophy, Target, Megaphone, Calendar as CalendarIcon } from 'lucide-react'
import AchievementsTab from '../components/AchievementsTab'

export default function StudentDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tab = searchParams.get('tab') || 'dashboard'
  
  const [courses, setCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [marks, setMarks] = useState([])
  const [achievements, setAchievements] = useState([])
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [timetables, setTimetables] = useState([])
  const [materials, setMaterials] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [
        enrolledRes, allRes, subRes, analyticsRes, 
        marksRes, achRes, evRes, annRes, timeRes
      ] = await Promise.all([
        courseAPI.getEnrolledCourses(),
        courseAPI.getAll(),
        submissionAPI.getMySubmissions(),
        analyticsAPI.getStudentAnalytics(),
        internalMarkAPI.getMyMarks(),
        achievementAPI.getMyAchievements(),
        eventAPI.getUpcoming(),
        announcementAPI.getForRole('STUDENT'),
        timetableAPI.getMy()
      ])
      setCourses(enrolledRes.data)
      setAllCourses(allRes.data)
      setSubmissions(subRes.data)
      setAnalytics(analyticsRes.data)
      setMarks(marksRes.data)
      setEvents(evRes.data)
      setAnnouncements(annRes.data)
      setTimetables(timeRes.data)
      setAchievements(achRes.data)
      
      const enrolledCourses = enrolledRes.data
      if (enrolledCourses.length > 0) {
        const materialsPromises = enrolledCourses.map(c => courseMaterialAPI.getByCourse(c.id))
        const materialsResults = await Promise.all(materialsPromises)
        const allMaterials = materialsResults.flatMap(r => r.data)
        allMaterials.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        setMaterials(allMaterials)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId)
    try {
      await courseAPI.enroll(courseId)
      await loadData()
    } catch (err) {
      alert(err.response?.data?.error || 'Enrollment failed')
    } finally {
      setEnrolling(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>

  const enrolledIds = courses.map(c => c.id)
  const availableCourses = allCourses.filter(c => !enrolledIds.includes(c.id))
  const myTimetables = timetables


  const dayOrder = { 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7 }
  const sortedTimetables = [...myTimetables].sort((a,b) => (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99))

  const getFileIcon = (type) => {
    const icons = { pdf: '📄', doc: '📝', docx: '📝', ppt: '📊', pptx: '📊', xls: '📈', xlsx: '📈', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', zip: '📦', mp4: '🎬', mp3: '🎵' }
    return icons[type] || '📎'
  }

  const studentModules = [
    { id: 'profile', label: 'Student Detail', icon: '👤', color: 'text-red-700' },
    { id: 'courses', label: 'Subjects', icon: '📚', color: 'text-blue-600' },
    { id: 'marks', label: 'Internal Marks', icon: '✒️', color: 'text-red-600' },
    { id: 'assignments', label: 'Assignment', icon: '📝', color: 'text-amber-600' },
    { id: 'achievements', label: 'Achievements', icon: '🏆', color: 'text-blue-600' },
    { id: 'events', label: 'Events', icon: '🎯', color: 'text-purple-500' },
    { id: 'announcement', label: 'Announcements', icon: '📢', color: 'text-orange-500' },
    { id: 'timetable', label: 'Timetable', icon: '📅', color: 'text-cyan-600' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between px-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent transform translate-y-1">Welcome, {user.name}!</h1>
          <p className="text-xs text-blue-400 font-medium mt-1 tracking-widest uppercase">Student Portal • {user.department || 'General'}</p>
        </div>
        {user.rollNumber && (
          <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400 font-bold text-sm">
            #{user.rollNumber}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {tab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {studentModules.map((module) => (
                <Link
                  key={module.id}
                  to={`?tab=${module.id}`}
                  className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`text-4xl mb-4 transform group-hover:scale-110 transition-transform ${module.color}`}>
                    {module.icon}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {module.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Timetable Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="dashboard-card border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                <div className="dashboard-card-header flex justify-between items-center text-xs uppercase tracking-widest bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 p-4">
                  <span className="font-bold text-gray-500">Today's Schedule</span>
                  <Link to="?tab=timetable" className="text-blue-500 hover:underline">View Full</Link>
                </div>
                <div className="p-4 space-y-3">
                  {sortedTimetables.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No classes today.</p>
                  ) : sortedTimetables.slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{t.courseTitle}</p>
                        <p className="text-xs text-gray-500">{t.startTime} - {t.endTime}</p>
                      </div>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded">{t.room}</span>
                    </div>
                  ))}
                </div>
              </div>

               <div className="dashboard-card border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                <div className="dashboard-card-header flex justify-between items-center text-xs uppercase tracking-widest bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 p-4">
                  <span className="font-bold text-gray-500">Upcoming Events</span>
                  <Link to="?tab=events" className="text-blue-500 hover:underline">View All</Link>
                </div>
                <div className="p-4 space-y-3">
                  {events.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No upcoming events.</p>
                  ) : events.slice(0, 3).map(e => (
                    <div key={e.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded flex flex-col items-center justify-center font-bold text-[10px] text-blue-600 dark:text-blue-400">
                        <span>{new Date(e.eventDate).getDate()}</span>
                        <span>{new Date(e.eventDate).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{e.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'courses' && (
          <div className="space-y-6 text-center">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="section-title flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-500"/> My Subjects</h2>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length === 0 ? (
                <div className="col-span-full py-16 glass-card">
                  <p className="text-sub">No enrolled subjects yet. Admins will enroll you.</p>
                </div>
              ) : courses.map(course => (
                <Link key={course.id} to={`/course/${course.id}`} className="glass-card-hover p-6 block text-left">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-xl">
                      📖
                    </div>
                    <span className="badge-primary">{course.moduleCount} modules</span>
                  </div>
                  <h3 className="text-lg font-semibold text-heading mb-1">{course.title}</h3>
                  <p className="text-xs text-muted truncate">by {course.instructorName}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === 'marks' && (
          <div className="glass-card overflow-hidden p-6">
            <h2 className="section-title mb-6 text-center">Internal Marks</h2>
            <div className="overflow-x-auto">
              {marks.length === 0 ? (
                <p className="p-6 text-sub text-center">No internal marks published yet.</p>
              ) : (
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                    <tr>
                      <th className="p-4 text-sm font-medium text-sub">Subject</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">Exam 1</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">Exam 2</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">Exam 3</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {marks.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                        <td className="p-4 text-heading font-medium">{m.courseTitle}</td>
                        <td className="p-4 text-sub text-center">{m.exam1 ?? '-'}</td>
                        <td className="p-4 text-sub text-center">{m.exam2 ?? '-'}</td>
                        <td className="p-4 text-sub text-center">{m.exam3 ?? '-'}</td>
                        <td className="p-4 text-primary-500 dark:text-primary-400 font-bold text-center">{m.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'achievements' && (
          <AchievementsTab achievements={achievements} onSubmit={loadData} />
        )}

        {tab === 'events' || tab === 'announcement' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h2 className="section-title text-center text-orange-500">📢 Announcements</h2>
              <div className="space-y-4 mt-6">
                {announcements.length === 0 ? <p className="text-sub text-center italic">No public announcements.</p> : announcements.map(a => (
                  <div key={a.id} className="p-4 rounded-xl border-l-4 border-orange-500 bg-orange-50/30 dark:bg-orange-950/10">
                    <h4 className="font-bold text-heading text-sm mb-1">{a.title}</h4>
                    <p className="text-xs text-sub mb-2">{a.content}</p>
                    <p className="text-[10px] text-muted flex justify-between"><span>{a.createdBy}</span> <span>{new Date(a.createdAt).toLocaleDateString()}</span></p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <h2 className="section-title text-center text-purple-500">🎯 Upcoming Events</h2>
              <div className="space-y-4 mt-6">
                {events.length === 0 ? <p className="text-sub text-center italic">No upcoming events listed.</p> : events.map(e => (
                  <div key={e.id} className="p-4 rounded-xl border-l-4 border-purple-500 bg-purple-50/30 dark:bg-purple-950/10 flex space-x-4">
                    <div className="w-12 h-12 bg-white dark:bg-black/20 rounded-lg flex flex-col items-center justify-center border border-purple-100 flex-shrink-0">
                      <span className="text-[10px] font-bold text-purple-600">{new Date(e.eventDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-lg font-bold text-heading leading-none">{new Date(e.eventDate).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-heading text-sm">{e.title}</h4>
                      <p className="text-[10px] text-sub">{e.type} • {e.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {tab === 'profile' && (
          <div className="glass-card p-6 sm:p-10 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full"></div>
            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 mb-8 sm:mb-10 pb-8 sm:pb-10 border-b border-gray-100 dark:border-white/5 text-center sm:text-left">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl shrink-0">
                    {user.name?.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-heading leading-tight">{user.name}</h2>
                    <p className="text-blue-500 font-bold text-xs sm:text-sm tracking-widest uppercase mt-1">Student Profile • Verified</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Name</label>
                  <p className="text-lg font-bold text-heading">{user.name}</p>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Roll Number</label>
                  <p className="text-lg font-bold text-heading">{user.rollNumber || '-'}</p>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</label>
                  <p className="text-lg font-bold text-heading">{user.email}</p>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</label>
                  <p className="text-lg font-bold text-heading">{user.department || '-'}</p>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Year</label>
                  <p className="text-lg font-bold text-heading">Year {user.year || '-'}</p>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Semester</label>
                  <p className="text-lg font-bold text-heading">Semester {user.semester || '-'}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone Number</label>
                  <p className="text-lg font-bold text-heading">{user.phoneNumber || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'timetable' && (
          <SharedTimetableTab 
            timetables={sortedTimetables} 
            title="My Class Timetable"
            subtitle={`Section ${user.section || '-'}`}
          />
        )}

        {tab === 'settings' && (
          <div className="animate-fade-in">
            <ChangePassword />
          </div>
        )}
      </div>
    </div>
  )
}
