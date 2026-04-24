import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminAPI, courseAPI, timetableAPI, syllabusAPI, internalMarkAPI, achievementAPI, announcementAPI, eventAPI, semesterCalendarAPI, assignmentAPI, structureAPI } from '../services/api'
import ChangePassword from '../components/ChangePassword'
import AdminTimetableTab from '../components/admin/AdminTimetableTab'
import AdminDepartmentTab from '../components/admin/AdminDepartmentTab'
import { GraduationCap, Users, Building2, BookOpen, BarChart2, Target } from 'lucide-react'

// ─────────────────── HARD-CODED DATA ───────────────────
const YEARS = [1, 2, 3, 4]
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Lecturer']

export default function AdminDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const activeTab = searchParams.get('tab') || 'dashboard'

  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [timetables, setTimetables] = useState([])
  const [stats, setStats] = useState({})
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Filters
  const [deptFilter, setDeptFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [semFilter, setSemFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [searchFaculty, setSearchFaculty] = useState('')
  const [searchStudent, setSearchStudent] = useState('')
  const [enrollCourseId, setEnrollCourseId] = useState('')

  // Forms
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'INSTRUCTOR', department: '', section: '', rollNumber: '', year: '', semester: '', phoneNumber: '' })
  const [ttForm, setTtForm] = useState({ courseId: '', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: '', building: '' })
  const [allocForm, setAllocForm] = useState({ courseId: '', instructorId: '' })

  useEffect(() => { loadData() }, [activeTab])

  const loadData = async () => {
    if (activeTab === 'settings') return
    setLoading(true)
    try {
      const deptsRes = await structureAPI.getDepartments()
      setDepartments(deptsRes.data)

      if (activeTab === 'dashboard') {
        const s = await adminAPI.getStats()
        setStats(s.data)
      } else if (activeTab === 'departments') {
        const [u, c] = await Promise.all([adminAPI.getAllUsers(), courseAPI.getAll()])
        setUsers(u.data)
        setCourses(c.data)
      } else if (activeTab === 'faculty') {
        const [u, c] = await Promise.all([adminAPI.getUsersByRole('INSTRUCTOR'), courseAPI.getAll()])
        setUsers(u.data)
        setCourses(c.data)
      } else if (activeTab === 'students') {
        const [u, c] = await Promise.all([adminAPI.getUsersByRole('STUDENT'), courseAPI.getAll()])
        setUsers(u.data)
        setCourses(c.data)
      } else if (activeTab === 'timetable') {
        const [t, c, u] = await Promise.all([timetableAPI.getAll(), courseAPI.getAll(), adminAPI.getUsersByRole('INSTRUCTOR')])
        setTimetables(t.data)
        setCourses(c.data)
        setUsers(u.data)
      } else if (activeTab === 'tracking') {
        const [u, c] = await Promise.all([adminAPI.getAllUsers(), courseAPI.getAll()])
        setUsers(u.data)
        setCourses(c.data)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000) }

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try { await adminAPI.deleteUser(id); showMsg('User deleted'); loadData() }
    catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  const handleSubmitUser = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await adminAPI.updateUser(editingId, userForm)
        showMsg('User updated successfully')
      } else {
        await adminAPI.createUser(userForm)
        showMsg('User created successfully')
      }
      resetUserForm()
      loadData()
    } catch (err) { alert(err.response?.data?.error || err.response?.data?.message || 'Failed') }
  }

  const handleEditUser = (u) => {
    setEditingId(u.id)
    setUserForm({ ...u, password: '', role: u.role })
    setShowForm(true)
  }

  const resetUserForm = () => {
    setUserForm({ name: '', email: '', password: '', role: activeTab === 'faculty' ? 'INSTRUCTOR' : 'STUDENT', department: '', section: '', rollNumber: '', year: '', semester: '', phoneNumber: '' })
    setShowForm(false)
    setEditingId(null)
  }

  const handleAllocate = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.allocateCourse({ courseId: Number(allocForm.courseId), instructorId: Number(allocForm.instructorId) })
      showMsg('Course allocated successfully')
      setAllocForm({ courseId: '', instructorId: '' })
      loadData()
    } catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  const handleAddTimetable = async (e) => {
    e.preventDefault()
    try {
      await timetableAPI.create({ ...ttForm, courseId: Number(ttForm.courseId) })
      showMsg('Schedule entry added')
      setTtForm({ courseId: '', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: '', building: '' })
      loadData()
    } catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  const handleBulkEnroll = async () => {
    if (!enrollCourseId) return alert('Select a course first');
    if (filteredStudents.length === 0) return alert('No students to enroll');
    if (!confirm(`Enroll ${filteredStudents.length} students into the selected course?`)) return;
    try {
      await adminAPI.enrollBulk({ courseId: Number(enrollCourseId), studentIds: filteredStudents.map(s => s.id) });
      showMsg('Students enrolled successfully')
      setEnrollCourseId('')
    } catch(err) { alert(err.response?.data?.error || 'Failed to enroll students') }
  }

  // Derived data
  const faculty = useMemo(() => users.filter(u => u.role === 'INSTRUCTOR'), [users])
  const students = useMemo(() => users.filter(u => u.role === 'STUDENT'), [users])
  const dynamicSections = useMemo(() => [...new Set(students.map(s => s.section).filter(Boolean))].sort(), [students])

  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      (!deptFilter || s.department === deptFilter) &&
      (!yearFilter || String(s.year) === yearFilter) &&
      (!semFilter || String(s.semester) === semFilter) &&
      (!sectionFilter || s.section === sectionFilter) &&
      (!searchStudent || s.name.toLowerCase().includes(searchStudent.toLowerCase()) || 
       (s.rollNumber && s.rollNumber.toLowerCase().includes(searchStudent.toLowerCase())))
    )
  }, [students, deptFilter, yearFilter, semFilter, sectionFilter, searchStudent])

  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => 
      (!deptFilter || f.department === deptFilter) &&
      (!searchFaculty || f.name.toLowerCase().includes(searchFaculty.toLowerCase()) || 
       f.email.toLowerCase().includes(searchFaculty.toLowerCase()))
    )
  }, [faculty, deptFilter, searchFaculty])

  // Group students by department for Dept tab
  const studentsByDept = useMemo(() => {
    const groups = {}
    departments.forEach(d => {
      groups[d.name] = {
        students: students.filter(s => s.department === d.name).length,
        faculty: faculty.filter(f => f.department === d.name).length,
        classes: [...new Set(students.filter(s => s.department === d.name).map(s => `Y${s.year}-S${s.semester}`))],
        sections: [...new Set(students.filter(s => s.department === d.name).map(s => s.section).filter(Boolean))]
      }
    })
    return groups
  }, [students, faculty, departments])

  return (
    <div>
      <div className="mb-6 animate-fade-in flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">Administrator Control Panel</h1>
          <p className="text-xs text-blue-400 font-medium mt-1 tracking-widest uppercase">LMS Governance • College Management</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-sm font-medium animate-fade-in">
          ✅ {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>
      ) : (
        <div className="animate-fade-in">

          {/* ═══════ DASHBOARD TAB ═══════ */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Students', value: stats.totalStudents || 0, icon: <GraduationCap className="text-blue-500 w-8 h-8" />, color: 'from-blue-500 to-indigo-600' },
                  { label: 'Total Faculty', value: stats.totalInstructors || 0, icon: <Users className="text-emerald-500 w-8 h-8" />, color: 'from-emerald-500 to-teal-600' },
                  { label: 'Departments', value: departments.length, icon: <Building2 className="text-purple-500 w-8 h-8" />, color: 'from-purple-500 to-violet-600' },
                  { label: 'Total Courses', value: stats.totalCourses || 0, icon: <BookOpen className="text-amber-500 w-8 h-8" />, color: 'from-amber-500 to-orange-600' }
                ].map((s, i) => (
                  <div key={i} className="glass-card p-5 relative overflow-hidden group hover:shadow-xl transition-shadow">
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.color} opacity-10 rounded-bl-[3rem] group-hover:opacity-20 transition-opacity`}></div>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-2xl font-black text-heading">{s.value}</div>
                    <div className="text-xs text-sub font-medium uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-500"/> Department Overview</h3>
                  <div className="space-y-3">
                    {departments.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                        <span className="font-medium text-heading text-sm">{d.name}</span>
                        <div className="flex gap-3">
                          <span className="text-xs badge-primary">{studentsByDept[d.name]?.students || 0} students</span>
                          <span className="text-xs badge-secondary">{studentsByDept[d.name]?.faculty || 0} faculty</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-rose-500"/> Quick Stats</h3>
                  <div className="space-y-4">
                    {Object.entries(stats).filter(([k]) => !['totalStudents','totalInstructors','totalCourses','totalQuizzes'].includes(k)).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                        <span className="text-sm text-sub capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold text-heading">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ TAB 1: CLASS / DEPARTMENT ═══════ */}
          {activeTab === 'departments' && (
            <AdminDepartmentTab showMsg={showMsg} />
          )}

          {/* ═══════ TAB 2: FACULTY ═══════ */}
          {activeTab === 'faculty' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="section-title mb-0">👨‍🏫 Faculty Management ({faculty.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <input type="text" className="input-field w-auto" placeholder="Search by name/email..." value={searchFaculty} onChange={e => setSearchFaculty(e.target.value)} />
                  <select className="input-field w-auto" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                  <button onClick={() => { showForm ? resetUserForm() : (setShowForm(true), setUserForm({...userForm, role: 'INSTRUCTOR'})) }} className="btn-primary text-sm whitespace-nowrap">
                    {showForm ? '✕ Cancel' : '➕ Add Faculty'}
                  </button>
                </div>
              </div>

              {showForm && (
                <form onSubmit={handleSubmitUser} className="glass-card p-6 mb-6 animate-slide-up">
                  <h3 className="text-lg font-semibold text-heading mb-4">{editingId ? '✏️ Edit Faculty' : '➕ Register New Faculty'}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div><label className="label-text">Full Name</label>
                      <input className="input-field" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required placeholder="Dr. John Smith" /></div>
                    <div><label className="label-text">Email</label>
                      <input type="email" className="input-field" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required placeholder="john@rit.edu" /></div>
                    <div><label className="label-text">Password {editingId && '(Leave blank to keep)'}</label>
                      <input type="password" className="input-field" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} minLength={6} required={!editingId} placeholder="••••••••" /></div>
                    <div><label className="label-text">Phone</label>
                      <input className="input-field" value={userForm.phoneNumber} onChange={e => setUserForm({...userForm, phoneNumber: e.target.value})} placeholder="+91 9876543210" /></div>
                    <div><label className="label-text">Department</label>
                      <select className="input-field" value={userForm.department} onChange={e => setUserForm({...userForm, department: e.target.value})}>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select></div>
                  </div>
                  <button type="submit" className="btn-primary w-full">{editingId ? 'Update Faculty' : 'Create Faculty Account'}</button>
                </form>
              )}

              {/* Subject Allocation */}
              <div className="glass-card p-6 mb-6">
                <h3 className="font-semibold text-heading mb-4">📋 Assign Faculty to Course</h3>
                <form onSubmit={handleAllocate} className="flex flex-col sm:flex-row gap-3">
                  <select value={allocForm.courseId} onChange={e => setAllocForm({...allocForm, courseId: e.target.value})} className="input-field flex-1" required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <select value={allocForm.instructorId} onChange={e => setAllocForm({...allocForm, instructorId: e.target.value})} className="input-field flex-1" required>
                    <option value="">Select Faculty</option>
                    {(deptFilter ? filteredFaculty : faculty).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button type="submit" className="btn-accent whitespace-nowrap">Assign</button>
                </form>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                        <th className="p-4 text-xs font-bold text-sub uppercase">Name</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Email</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Phone</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Department</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {(deptFilter ? filteredFaculty : faculty).map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 group">
                          <td className="p-4 font-bold text-heading text-sm">{u.name}</td>
                          <td className="p-4 text-xs text-sub">{u.email}</td>
                          <td className="p-4 text-sm text-sub">{u.phoneNumber || '-'}</td>
                          <td className="p-4"><span className="badge-primary text-xs">{u.department || '-'}</span></td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleEditUser(u)} className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg" title="Edit">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title="Delete">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(deptFilter ? filteredFaculty : faculty).length === 0 && <tr><td colSpan={5} className="p-12 text-center text-muted">No faculty found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ TAB 3: STUDENTS ═══════ */}
          {activeTab === 'students' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="section-title mb-0">👩‍🎓 Student Management ({users.length})</h2>
                <button onClick={() => { showForm ? resetUserForm() : (setShowForm(true), setUserForm({...userForm, role: 'STUDENT'})) }} className="btn-primary text-sm">
                  {showForm ? '✕ Cancel' : '➕ Add Student'}
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmitUser} className="glass-card p-6 mb-6 animate-slide-up">
                  <h3 className="text-lg font-semibold text-heading mb-4">{editingId ? '✏️ Edit Student' : '➕ Register New Student'}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div><label className="label-text">Full Name</label>
                      <input className="input-field" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required placeholder="Student Name" /></div>
                    <div><label className="label-text">Email</label>
                      <input type="email" className="input-field" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required placeholder="student@rit.edu" /></div>
                    <div><label className="label-text">Password {editingId && '(Leave blank to keep)'}</label>
                      <input type="password" className="input-field" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} minLength={6} required={!editingId} placeholder="••••••••" /></div>
                    <div><label className="label-text">Register Number</label>
                      <input className="input-field" value={userForm.rollNumber} onChange={e => setUserForm({...userForm, rollNumber: e.target.value})} required placeholder="RA2211003010001" /></div>
                    <div><label className="label-text">Phone</label>
                      <input className="input-field" value={userForm.phoneNumber} onChange={e => setUserForm({...userForm, phoneNumber: e.target.value})} placeholder="+91 9876543210" /></div>
                    <div><label className="label-text">Department</label>
                      <select className="input-field" value={userForm.department} onChange={e => setUserForm({...userForm, department: e.target.value})} required>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select></div>
                    <div><label className="label-text">Year</label>
                      <select className="input-field" value={userForm.year} onChange={e => setUserForm({...userForm, year: e.target.value})} required>
                        <option value="">Select Year</option>
                        {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select></div>
                    <div><label className="label-text">Semester</label>
                      <select className="input-field" value={userForm.semester} onChange={e => setUserForm({...userForm, semester: e.target.value})} required>
                        <option value="">Select Semester</option>
                        {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select></div>
                    <div><label className="label-text">Section</label>
                      <input type="text" className="input-field" value={userForm.section} onChange={e => setUserForm({...userForm, section: e.target.value})} placeholder="e.g. A, B, G" required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full">{editingId ? 'Update Student' : 'Create Student Account'}</button>
                </form>
              )}

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2 flex-1">
                  <input type="text" className="input-field w-full sm:w-auto sm:min-w-[180px]" placeholder="Search by name/roll..." value={searchStudent} onChange={e => setSearchStudent(e.target.value)} />
                  <select className="input-field w-[calc(50%-4px)] sm:w-auto" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                    <option value="">All Depts</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                  <select className="input-field w-[calc(50%-4px)] sm:w-auto" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                    <option value="">All Years</option>
                    {YEARS.map(y => <option key={y} value={String(y)}>Year {y}</option>)}
                  </select>
                  <select className="input-field w-[calc(50%-4px)] sm:w-auto" value={semFilter} onChange={e => setSemFilter(e.target.value)}>
                    <option value="">All Sems</option>
                    {SEMESTERS.map(s => <option key={s} value={String(s)}>Sem {s}</option>)}
                  </select>
                  <select className="input-field w-[calc(50%-4px)] sm:w-auto" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                    <option value="">All Sections</option>
                    {dynamicSections.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                
                {/* Bulk Enroll UI */}
                <div className="glass-card p-3 flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <span className="text-xs font-bold text-sub whitespace-nowrap">Enroll Filtered ({filteredStudents.length})</span>
                  <select value={enrollCourseId} onChange={e => setEnrollCourseId(e.target.value)} className="input-field !py-1.5 min-w-[150px]">
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <button onClick={handleBulkEnroll} className="btn-accent !py-1.5 whitespace-nowrap">Bulk Enroll</button>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                        <th className="p-4 text-xs font-bold text-sub uppercase">Reg. No</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Name</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Email</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Department</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Year</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Sem</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Section</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase">Phone</th>
                        <th className="p-4 text-xs font-bold text-sub uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {filteredStudents.sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || '', undefined, { numeric: true })).map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 group">
                          <td className="p-4"><span className="font-mono text-xs font-bold py-1 px-2 bg-primary-500/10 text-primary-500 rounded-lg">{u.rollNumber || '-'}</span></td>
                          <td className="p-4 font-bold text-heading text-sm">{u.name}</td>
                          <td className="p-4 text-xs text-sub">{u.email}</td>
                          <td className="p-4"><span className="badge-primary text-[10px]">{u.department || '-'}</span></td>
                          <td className="p-4 text-sm text-heading">{u.year || '-'}</td>
                          <td className="p-4 text-sm text-heading">{u.semester || '-'}</td>
                          <td className="p-4 text-sm text-heading">{u.section || '-'}</td>
                          <td className="p-4 text-sm text-sub">{u.phoneNumber || '-'}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleEditUser(u)} className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg" title="Edit">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title="Delete">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && <tr><td colSpan={9} className="p-12 text-center text-muted">No students found with the current filters.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ TAB 4: PLAN TIMETABLE ═══════ */}
          {activeTab === 'timetable' && (
            <AdminTimetableTab courses={courses} users={users} showMsg={showMsg} />
          )}

          {/* ═══════ TAB 5: TRACKING SYSTEM ═══════ */}
          {activeTab === 'tracking' && (
            <TrackingTab courses={courses} faculty={faculty} students={students} />
          )}

          {/* ═══════ SETTINGS ═══════ */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <ChangePassword />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════ TRACKING SYSTEM TAB COMPONENT ═══════
function TrackingTab({ courses, faculty, students }) {
  const [trackingView, setTrackingView] = useState('faculty') // 'faculty' or 'student'
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [syllabusData, setSyllabusData] = useState([])
  const [marksData, setMarksData] = useState([])
  const [achievementsData, setAchievementsData] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  const loadTrackingData = async (courseId) => {
    if (!courseId) return
    setLoadingData(true)
    try {
      const [sylRes, markRes] = await Promise.all([
        syllabusAPI.getByCourse(courseId),
        internalMarkAPI.getByCourse(courseId)
      ])
      setSyllabusData(sylRes.data)
      setMarksData(markRes.data)
    } catch (err) { console.error(err) }
    setLoadingData(false)
  }

  useEffect(() => {
    if (selectedCourseId) loadTrackingData(selectedCourseId)
  }, [selectedCourseId])

  const syllabusProgress = syllabusData.length > 0
    ? Math.round((syllabusData.filter(s => s.completed).length / syllabusData.length) * 100)
    : 0

  return (
    <div>
      <h2 className="section-title">📈 Tracking System</h2>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTrackingView('faculty')} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${trackingView === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}>
          👨‍🏫 Faculty Tracking
        </button>
        <button onClick={() => setTrackingView('student')} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${trackingView === 'student' ? 'btn-primary' : 'btn-secondary'}`}>
          👩‍🎓 Student Tracking
        </button>
      </div>

      {/* Course Selector */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="text-sm font-bold text-heading whitespace-nowrap">Select Course:</label>
          <select className="input-field flex-1" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
            <option value="">— Choose a course to track —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      {loadingData && <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div></div>}

      {!loadingData && selectedCourseId && trackingView === 'faculty' && (
        <div className="space-y-6">
          {/* Syllabus Completion */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-heading">📋 Syllabus Completion</h3>
              <span className={`text-sm font-bold ${syllabusProgress >= 80 ? 'text-emerald-500' : syllabusProgress >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {syllabusProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 mb-4">
              <div className={`h-3 rounded-full transition-all duration-500 ${syllabusProgress >= 80 ? 'bg-emerald-500' : syllabusProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${syllabusProgress}%` }}></div>
            </div>
            <div className="space-y-2">
              {syllabusData.map((s, i) => (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl ${s.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-50 dark:bg-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.completed ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-sub'}`}>
                      {s.completed ? '✓' : i + 1}
                    </span>
                    <span className={`text-sm ${s.completed ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-heading font-medium'}`}>{s.topic}</span>
                  </div>
                  {s.completedDate && <span className="text-[10px] text-muted">{new Date(s.completedDate).toLocaleDateString()}</span>}
                </div>
              ))}
              {syllabusData.length === 0 && <p className="text-center text-muted py-4">No syllabus data found for this course.</p>}
            </div>
          </div>

          {/* Faculty Summary */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-heading mb-4">👨‍🏫 Faculty Summary</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{syllabusData.length}</div>
                <div className="text-[10px] text-sub uppercase font-bold">Total Topics</div>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{syllabusData.filter(s => s.completed).length}</div>
                <div className="text-[10px] text-sub uppercase font-bold">Completed</div>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{syllabusData.filter(s => !s.completed).length}</div>
                <div className="text-[10px] text-sub uppercase font-bold">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loadingData && selectedCourseId && trackingView === 'student' && (
        <div className="space-y-6">
          {/* Internal Marks */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-heading">✒️ Internal Marks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                    <th className="p-4 text-xs font-bold text-sub uppercase">Student</th>
                    <th className="p-4 text-xs font-bold text-sub uppercase text-center">Exam 1</th>
                    <th className="p-4 text-xs font-bold text-sub uppercase text-center">Exam 2</th>
                    <th className="p-4 text-xs font-bold text-sub uppercase text-center">Exam 3</th>
                    <th className="p-4 text-xs font-bold text-sub uppercase text-center">Attendance</th>
                    <th className="p-4 text-xs font-bold text-sub uppercase text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {marksData.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                      <td className="p-4 font-medium text-heading text-sm">{m.studentName}</td>
                      <td className="p-4 text-sub text-center text-sm">{m.exam1 ?? '-'}</td>
                      <td className="p-4 text-sub text-center text-sm">{m.exam2 ?? '-'}</td>
                      <td className="p-4 text-sub text-center text-sm">{m.exam3 ?? '-'}</td>
                      <td className="p-4 text-sub text-center text-sm">{m.attendance ?? '-'}</td>
                      <td className="p-4 text-center">
                        <span className={`font-bold ${(m.total || 0) >= 70 ? 'text-emerald-500' : (m.total || 0) >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          {m.total ?? '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {marksData.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted">No internal marks data found for this course.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Stats */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-heading mb-4">📊 Student Performance Summary</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{marksData.length}</div>
                <div className="text-[10px] text-sub uppercase font-bold">Students Tracked</div>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {marksData.length > 0 ? Math.round(marksData.reduce((sum, m) => sum + (m.total || 0), 0) / marksData.length) : 0}
                </div>
                <div className="text-[10px] text-sub uppercase font-bold">Average Score</div>
              </div>
              <div className="bg-rose-500/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {marksData.filter(m => (m.total || 0) < 50).length}
                </div>
                <div className="text-[10px] text-sub uppercase font-bold">Below Average</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedCourseId && !loadingData && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-sub font-medium">Select a course above to view tracking data</p>
          <p className="text-muted text-sm mt-1">Track faculty syllabus progress and student performance</p>
        </div>
      )}
    </div>
  )
}
