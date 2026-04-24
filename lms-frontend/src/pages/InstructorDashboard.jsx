import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { courseAPI, quizAPI, assignmentAPI, analyticsAPI, internalMarkAPI, syllabusAPI, timetableAPI, courseMaterialAPI } from '../services/api'
import { GraduationCap } from 'lucide-react'
import ChangePassword from '../components/ChangePassword'
import SharedTimetableTab from '../components/SharedTimetableTab'

export default function FacultyDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tab = searchParams.get('tab') || 'courses'
  
  const [courses, setCourses] = useState([])
  const [marks, setMarks] = useState([])
  const [syllabus, setSyllabus] = useState([])
  const [timetables, setTimetables] = useState([])
  const [materials, setMaterials] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [materialForm, setMaterialForm] = useState({ title: '', description: '' })
  const [uploading, setUploading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [showCreateQuiz, setShowCreateQuiz] = useState(false)
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  
  // Forms
  const [courseForm, setCourseForm] = useState({ title: '', description: '' })
  const [quizForm, setQuizForm] = useState({ title: '', description: '', courseId: '', totalMarks: 100, durationMinutes: 30, questions: [], externalUrl: '' })
  const [quizMode, setQuizMode] = useState('manual') // 'manual' or 'external'
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', courseId: '', totalMarks: 100, deadline: '' })
  const [questionForm, setQuestionForm] = useState({ text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', marks: 10 })
  const [markForm, setMarkForm] = useState({ studentId: '', exam1: '', exam2: '', exam3: '', attendance: '' })
  const [syllabusForm, setSyllabusForm] = useState({ topic: '', description: '', orderIndex: 1 })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [coursesRes, analyticsRes, timeRes] = await Promise.all([
        courseAPI.getInstructorCourses(),
        analyticsAPI.getInstructorAnalytics(),
        timetableAPI.getMy()
      ])
      const myCourses = coursesRes.data
      setCourses(myCourses)
      setAnalytics(analyticsRes.data)
      setTimetables(timeRes.data)
      
      if (myCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(myCourses[0].id)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseSpecificData(selectedCourseId)
    }
  }, [selectedCourseId, tab])

  const loadCourseSpecificData = async (courseId) => {
    try {
      if (tab === 'marks') {
        const res = await internalMarkAPI.getByCourse(courseId)
        setMarks(res.data)
      } else if (tab === 'syllabus') {
        const res = await syllabusAPI.getByCourse(courseId)
        setSyllabus(res.data)
      } else if (tab === 'materials') {
        const res = await courseMaterialAPI.getByCourse(courseId)
        setMaterials(res.data)
      }
    } catch (err) { console.error(err) }
  }

  // Basic Create Handlers
  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try { await courseAPI.create(courseForm); setCourseForm({ title: '', description: '' }); setShowCreateCourse(false); loadData() }
    catch (err) { alert(err.response?.data?.error || 'Failed') }
  }
  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...quizForm,
        courseId: parseInt(quizForm.courseId),
        totalMarks: parseInt(quizForm.totalMarks),
        durationMinutes: parseInt(quizForm.durationMinutes),
        externalUrl: quizMode === 'external' ? quizForm.externalUrl : null,
        questions: quizMode === 'manual' ? quizForm.questions : [],
      }
      await quizAPI.create(payload)
      setQuizForm({ title: '', description: '', courseId: '', totalMarks: 100, durationMinutes: 30, questions: [], externalUrl: '' })
      setQuizMode('manual')
      setShowCreateQuiz(false); loadData()
    }
    catch (err) { alert(err.response?.data?.error || 'Failed') }
  }
  const addQuestion = () => {
    const q = { ...questionForm, options: questionForm.type === 'MCQ' ? questionForm.options.filter(o => o.trim()) : [] }
    setQuizForm({ ...quizForm, questions: [...quizForm.questions, q] })
    setQuestionForm({ text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', marks: 10 })
  }
  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try { await assignmentAPI.create({...assignmentForm, courseId: parseInt(assignmentForm.courseId), totalMarks: parseInt(assignmentForm.totalMarks)})
      setAssignmentForm({ title: '', description: '', courseId: '', totalMarks: 100, deadline: '' }); setShowCreateAssignment(false) }
    catch (err) { alert(err.response?.data?.error || 'Failed') }
  }
  const handleDeleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return
    try { await courseAPI.delete(id); loadData() } catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  // New Feature Handlers
  const handleUploadMark = async (e) => {
    e.preventDefault()
    try {
      await internalMarkAPI.upload({ ...markForm, courseId: selectedCourseId })
      setMarkForm({ studentId: '', exam1: '', exam2: '', exam3: '', attendance: '' })
      loadCourseSpecificData(selectedCourseId)
      alert('Mark uploaded successfully')
    } catch(err) { alert('Failed to upload mark') }
  }
  
  const handleAddSyllabus = async (e) => {
    e.preventDefault()
    try {
      await syllabusAPI.create({ ...syllabusForm, courseId: selectedCourseId })
      setSyllabusForm({ topic: '', description: '', orderIndex: syllabus.length + 1 })
      loadCourseSpecificData(selectedCourseId)
    } catch(err) { alert('Failed') }
  }

  const handleGenerateSyllabus = async () => {
    try {
      if (!confirm('This will generate 45 tracking periods (5 Units x 9 Periods). Proceed?')) return;
      setLoading(true);
      const promises = [];
      let globalIndex = 1;
      for (let u = 1; u <= 5; u++) {
        for (let p = 1; p <= 9; p++) {
          promises.push(syllabusAPI.create({
             courseId: selectedCourseId,
             topic: `Unit ${u} - Period ${p}`,
             description: 'Topic not specified yet',
             orderIndex: globalIndex++
          }));
        }
      }
      await Promise.all(promises);
      await loadCourseSpecificData(selectedCourseId);
    } catch(err) { alert('Failed generating syllabus structure'); }
    finally { setLoading(false); }
  }

  const handleUploadMaterial = async (e) => {
    e.preventDefault()
    if (!uploadFile || !selectedCourseId) return
    setUploading(true)
    try {
      await courseMaterialAPI.upload(selectedCourseId, materialForm.title, materialForm.description, uploadFile)
      setMaterialForm({ title: '', description: '' })
      setUploadFile(null)
      // Reset file input
      const fileInput = document.getElementById('material-file-input')
      if (fileInput) fileInput.value = ''
      loadCourseSpecificData(selectedCourseId)
      alert('Material uploaded successfully!')
    } catch (err) { alert(err.response?.data?.error || 'Upload failed') }
    finally { setUploading(false) }
  }

  const handleDeleteMaterial = async (id) => {
    if (!confirm('Delete this material?')) return
    try { await courseMaterialAPI.delete(id); loadCourseSpecificData(selectedCourseId) }
    catch (err) { alert('Delete failed') }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    const icons = { pdf: '📄', doc: '📝', docx: '📝', ppt: '📊', pptx: '📊', xls: '📈', xlsx: '📈', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', zip: '📦', mp4: '🎬', mp3: '🎵' }
    return icons[type] || '📎'
  }

  const handleToggleSyllabus = async (id) => {
    try { await syllabusAPI.toggleComplete(id); loadCourseSpecificData(selectedCourseId) }
    catch(err) { console.error(err) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>

  return (
    <div className="page-container">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-heading flex items-center gap-3"><GraduationCap className="w-8 h-8 text-blue-500"/> Faculty Dashboard</h1>
          <p className="text-sub mt-1">Manage courses, quizzes, assignments and student progress</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <button onClick={() => setShowCreateCourse(true)} className="btn-primary text-sm !py-2">+ Course</button>
          <button onClick={() => setShowCreateQuiz(true)} className="btn-accent text-sm !py-2">+ Quiz</button>
          <button onClick={() => setShowCreateAssignment(true)} className="btn-secondary text-sm !py-2">+ Assignment</button>
        </div>
      </div>

      <div className="animate-fade-in">
        {tab === 'courses' && (
          <>
            {/* Stats */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
                <div className="stat-card"><div className="stat-value">{analytics.totalCourses}</div><div className="stat-label">Courses</div></div>
                <div className="stat-card"><div className="stat-value">{analytics.totalStudents}</div><div className="stat-label">Students</div></div>
                <div className="stat-card"><div className="stat-value">{analytics.totalQuizzes}</div><div className="stat-label">Quizzes</div></div>
                <div className="stat-card"><div className="stat-value">{analytics.totalAssignments}</div><div className="stat-label">Assignments</div></div>
                <div className="stat-card"><div className="stat-value">{analytics.averageScore}%</div><div className="stat-label">Avg Score</div></div>
              </div>
            )}

            {/* Courses */}
            <h2 className="section-title">Your Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.length === 0 ? (
                <div className="col-span-full text-center py-16 glass-card">
                  <div className="text-5xl mb-4">📖</div>
                  <p className="text-sub">No courses created yet</p>
                  <button onClick={() => setShowCreateCourse(true)} className="btn-primary mt-4 text-sm">Create Your First Course</button>
                </div>
              ) : courses.map(course => (
                <div key={course.id} className="glass-card-hover p-6 group">
                  <div className="flex items-start justify-between mb-3">
                    <Link to={`/course/${course.id}`} className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-xl hover:scale-105 transition-transform">
                      📖
                    </Link>
                    <div className="flex space-x-1">
                      <span className="badge-primary">{course.moduleCount} modules</span>
                      <span className="badge-accent">{course.studentCount} students</span>
                    </div>
                  </div>
                  <Link to={`/course/${course.id}`}>
                    <h3 className="text-lg font-semibold text-heading mb-1 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">{course.title}</h3>
                  </Link>
                  <p className="text-sub text-sm line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteCourse(course.id)} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics Table */}
            {analytics?.courseAnalytics?.length > 0 && (
              <>
                <h2 className="section-title">Course Performance</h2>
                <div className="glass-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/5">
                        <th className="text-left text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Course</th>
                        <th className="text-center text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Students</th>
                        <th className="text-center text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Quizzes</th>
                        <th className="text-center text-xs font-medium text-gray-500 dark:text-surface-400 uppercase px-6 py-3">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.courseAnalytics.map(ca => (
                        <tr key={ca.courseId} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-heading font-medium">{ca.courseTitle}</td>
                          <td className="px-6 py-4 text-sm text-sub text-center">{ca.enrolledStudents}</td>
                          <td className="px-6 py-4 text-sm text-sub text-center">{ca.quizCount}</td>
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
              </>
            )}
          </>
        )}

        {/* MARKS TAB */}
        {tab === 'marks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">Upload Internal Marks</h2>
              <select className="input-field w-auto min-w-[200px]" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <form onSubmit={handleUploadMark} className="glass-card p-6 sticky top-24">
                  <h3 className="font-semibold text-heading mb-4">Upload Mark Record</h3>
                  <div className="space-y-3">
                    <div><label className="label-text">Student ID</label>
                      <input className="input-field" required value={markForm.studentId} onChange={e => setMarkForm({...markForm, studentId: e.target.value})} placeholder="Database ID" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label-text">Exam 1 (Optional)</label>
                        <input type="number" className="input-field" value={markForm.exam1} onChange={e => setMarkForm({...markForm, exam1: e.target.value})} /></div>
                      <div><label className="label-text">Exam 2 (Optional)</label>
                        <input type="number" className="input-field" value={markForm.exam2} onChange={e => setMarkForm({...markForm, exam2: e.target.value})} /></div>
                      <div><label className="label-text">Exam 3 (Optional)</label>
                        <input type="number" className="input-field" value={markForm.exam3} onChange={e => setMarkForm({...markForm, exam3: e.target.value})} /></div>
                      <div><label className="label-text">Attendance (Optional)</label>
                        <input type="number" className="input-field" value={markForm.attendance} onChange={e => setMarkForm({...markForm, attendance: e.target.value})} /></div>
                    </div>
                    <button type="submit" className="btn-primary w-full mt-2">Upload Marks</button>
                  </div>
                </form>
              </div>
              
              <div className="md:col-span-2 glass-card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                    <tr>
                      <th className="p-4 text-sm font-medium text-sub">Student</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">E1</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">E2</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">E3</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">Att</th>
                      <th className="p-4 text-sm font-medium text-sub text-center">Total</th>
                      <th className="p-4 text-sm font-medium text-sub"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {marks.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                        <td className="p-4 text-heading font-medium text-sm">{m.studentName}</td>
                        <td className="p-4 text-sub text-center text-sm">{m.exam1 ?? '-'}</td>
                        <td className="p-4 text-sub text-center text-sm">{m.exam2 ?? '-'}</td>
                        <td className="p-4 text-sub text-center text-sm">{m.exam3 ?? '-'}</td>
                        <td className="p-4 text-sub text-center text-sm">{m.attendance ?? '-'}</td>
                        <td className="p-4 text-primary-500 dark:text-primary-400 font-bold text-center">{m.total}</td>
                        <td className="p-4"><button onClick={() => { internalMarkAPI.delete(m.id); loadCourseSpecificData(selectedCourseId) }} className="text-red-400 hover:text-red-300 text-xs">Delete</button></td>
                      </tr>
                    ))}
                    {marks.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-sub">No marks uploaded for this course yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STUDY MATERIALS TAB */}
        {tab === 'materials' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">Upload Study Materials</h2>
              <select className="input-field w-auto min-w-[200px]" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Upload Form */}
              <div className="md:col-span-1">
                <form onSubmit={handleUploadMaterial} className="glass-card p-6 sticky top-24">
                  <h3 className="font-semibold text-heading mb-4">📤 Upload File</h3>
                  <div className="space-y-3">
                    <div><label className="label-text">Title</label>
                      <input className="input-field" required value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} placeholder="e.g. Chapter 1 Notes" /></div>
                    <div><label className="label-text">Description (Optional)</label>
                      <textarea className="input-field" rows={2} value={materialForm.description} onChange={e => setMaterialForm({...materialForm, description: e.target.value})} placeholder="Brief description..." /></div>
                    <div><label className="label-text">File</label>
                      <input id="material-file-input" type="file" className="input-field file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-500 file:text-white hover:file:bg-primary-400 cursor-pointer" required onChange={e => setUploadFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.mp4,.mp3,.txt" /></div>
                    {uploadFile && (
                      <div className="bg-primary-500/10 rounded-lg p-3 text-sm">
                        <p className="text-heading font-medium truncate">{uploadFile.name}</p>
                        <p className="text-sub text-xs">{formatFileSize(uploadFile.size)}</p>
                      </div>
                    )}
                    <button type="submit" disabled={uploading || !uploadFile} className="btn-primary w-full mt-2">
                      {uploading ? (
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          <span>Uploading...</span>
                        </span>
                      ) : '📤 Upload Material'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Materials List */}
              <div className="md:col-span-2 space-y-3">
                {materials.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <div className="text-5xl mb-4">📁</div>
                    <p className="text-sub">No materials uploaded for this course yet.</p>
                    <p className="text-muted text-sm mt-1">Upload PDFs, documents, presentations, or any study material.</p>
                  </div>
                ) : materials.map(m => (
                  <div key={m.id} className="glass-card p-4 flex items-center justify-between hover:border-primary-500/30 transition-colors group">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {getFileIcon(m.fileType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-heading truncate">{m.title}</h4>
                        {m.description && <p className="text-sm text-sub truncate">{m.description}</p>}
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-muted">{m.originalFileName}</span>
                          <span className="text-xs text-muted">•</span>
                          <span className="text-xs text-muted">{formatFileSize(m.fileSize)}</span>
                          <span className="text-xs text-muted">•</span>
                          <span className="text-xs text-muted">{new Date(m.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                      <a href={`/api/files/${m.storedFileName}`} target="_blank" rel="noreferrer" className="btn-secondary text-xs !py-1.5 !px-3">⬇ Download</a>
                      <button onClick={() => handleDeleteMaterial(m.id)} className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SYLLABUS TAB */}
        {tab === 'syllabus' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">Syllabus Tracking</h2>
              <select className="input-field w-auto min-w-[200px]" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <form onSubmit={handleAddSyllabus} className="glass-card p-6 sticky top-24">
                  <h3 className="font-semibold text-heading mb-4">Add Custom Topic</h3>
                  <div className="space-y-3">
                    <div><label className="label-text">Topic Name</label>
                      <input className="input-field" required value={syllabusForm.topic} onChange={e => setSyllabusForm({...syllabusForm, topic: e.target.value})} /></div>
                    <div><label className="label-text">Description</label>
                      <textarea className="input-field" rows={2} value={syllabusForm.description} onChange={e => setSyllabusForm({...syllabusForm, description: e.target.value})} /></div>
                    <button type="submit" className="btn-primary w-full mt-2">Add Topic</button>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                    <h3 className="font-semibold text-heading mb-2">Structure Setup</h3>
                    <p className="text-xs text-sub mb-4">Automatically setup tracking for 5 Units (9 Periods per unit). Total 45 periods.</p>
                    <button type="button" onClick={handleGenerateSyllabus} disabled={syllabus.length > 0} className="btn-secondary w-full text-xs !py-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      Auto-Generate (5x9)
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="md:col-span-2 space-y-3">
                {syllabus.length === 0 ? <div className="glass-card p-8 text-center text-sub border border-dashed border-gray-300 dark:border-gray-700">No syllabus tracking found. Please add topics or Auto-Generate the structure from the panel.</div> : [...syllabus].sort((a,b)=>a.id-b.id).map((item, index) => (
                  <div key={item.id} className={`glass-card p-4 flex items-center justify-between transition-colors border ${item.completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-transparent hover:border-blue-500/30'}`}>
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        <input type="checkbox" checked={item.completed} onChange={() => handleToggleSyllabus(item.id)} className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                      </div>
                      <div className="flex-1 pr-4">
                        <div className="flex items-center space-x-3 mb-1">
                           <h4 className={`font-bold text-sm tracking-wide uppercase ${item.completed ? 'text-emerald-600 dark:text-emerald-400 opacity-80' : 'text-blue-600'}`}>
                             {item.topic}
                           </h4>
                           {item.completed && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Completed</span>}
                        </div>
                        <p className={`text-sm ${item.completed ? 'text-gray-400 line-through decoration-emerald-500/30 opacity-70' : 'text-heading font-medium'}`}>{item.description}</p>
                        {item.completedDate && <p className="text-xs text-emerald-600/70 mt-2 font-medium">Marked completed on {new Date(item.completedDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                    <div>
                       <button onClick={() => { syllabusAPI.delete(item.id); loadCourseSpecificData(selectedCourseId) }} className="w-8 h-8 rounded bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIMETABLE TAB */}
        {tab === 'timetable' && (
          <SharedTimetableTab 
            timetables={timetables} 
            title="My Faculty Timetable"
            subtitle={user.name}
          />
        )}

        {tab === 'settings' && (
          <div className="animate-fade-in">
            <ChangePassword />
          </div>
        )}

      </div>

      {/* Modals remain the same */}
      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateCourse(false)}>
          <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-heading mb-6">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div><label className="label-text">Title</label>
                <input className="input-field" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} required /></div>
              <div><label className="label-text">Description</label>
                <textarea className="input-field" rows={3} value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} /></div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowCreateCourse(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowCreateQuiz(false)}>
          <div className="glass-card p-8 w-full max-w-2xl my-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-heading mb-6">Create Quiz</h2>

            {/* Mode Toggle */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-white/10 p-1 mb-6">
              <button type="button" onClick={() => setQuizMode('manual')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${quizMode === 'manual' ? 'bg-white dark:bg-white/20 text-heading shadow-sm' : 'text-sub hover:text-heading'}`}>
                ✍️ Manual Questions
              </button>
              <button type="button" onClick={() => setQuizMode('external')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${quizMode === 'external' ? 'bg-white dark:bg-white/20 text-heading shadow-sm' : 'text-sub hover:text-heading'}`}>
                🔗 External Link
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Title</label>
                  <input className="input-field" value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} required /></div>
                <div><label className="label-text">Course</label>
                  <select className="input-field" value={quizForm.courseId} onChange={e => setQuizForm({...quizForm, courseId: e.target.value})} required>
                    <option value="">Select course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select></div>
              </div>
              <div><label className="label-text">Description</label>
                <textarea className="input-field" rows={2} value={quizForm.description} onChange={e => setQuizForm({...quizForm, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Total Marks</label>
                  <input type="number" className="input-field" value={quizForm.totalMarks} onChange={e => setQuizForm({...quizForm, totalMarks: e.target.value})} /></div>
                <div><label className="label-text">Duration (min)</label>
                  <input type="number" className="input-field" value={quizForm.durationMinutes} onChange={e => setQuizForm({...quizForm, durationMinutes: e.target.value})} /></div>
              </div>

              {/* External Link Mode */}
              {quizMode === 'external' && (
                <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-400">🔗 Paste a link to an external quiz (Google Forms, Microsoft Forms, or any website). Students will click this link to take the quiz.</p>
                  </div>
                  <div><label className="label-text">Quiz URL</label>
                    <input className="input-field" value={quizForm.externalUrl} onChange={e => setQuizForm({...quizForm, externalUrl: e.target.value})} placeholder="https://forms.google.com/..." required /></div>
                </div>
              )}

              {/* Manual Questions Mode */}
              {quizMode === 'manual' && (
                <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-heading mb-3">Questions ({quizForm.questions.length})</h3>
                  {quizForm.questions.map((q, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-white/5 rounded-lg p-3 mb-2 flex justify-between items-center">
                      <span className="text-sm text-sub truncate flex-1">{i+1}. {q.text}</span>
                      <span className="badge-primary ml-2">{q.type} • {q.marks}pts</span>
                    </div>
                  ))}

                  <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-4 mt-3 space-y-3">
                    <div><label className="label-text">Question Text</label>
                      <input className="input-field" value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="label-text">Type</label>
                        <select className="input-field" value={questionForm.type} onChange={e => setQuestionForm({...questionForm, type: e.target.value})}>
                          <option value="MCQ">MCQ</option><option value="DESCRIPTIVE">Descriptive</option>
                        </select></div>
                      <div><label className="label-text">Marks</label>
                        <input type="number" className="input-field" value={questionForm.marks} onChange={e => setQuestionForm({...questionForm, marks: parseInt(e.target.value)})} /></div>
                    </div>
                    {questionForm.type === 'MCQ' && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {questionForm.options.map((opt, i) => (
                            <input key={i} className="input-field text-sm" placeholder={`Option ${i+1}`} value={opt}
                              onChange={e => { const opts = [...questionForm.options]; opts[i] = e.target.value; setQuestionForm({...questionForm, options: opts}) }} />
                          ))}
                        </div>
                        <div><label className="label-text">Correct Answer</label>
                          <input className="input-field" value={questionForm.correctAnswer} onChange={e => setQuestionForm({...questionForm, correctAnswer: e.target.value})} placeholder="Enter the correct option text" /></div>
                      </>
                    )}
                    <button type="button" onClick={addQuestion} disabled={!questionForm.text}
                      className="btn-secondary text-sm !py-1.5 w-full">+ Add Question</button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-accent flex-1" disabled={quizMode === 'manual' && quizForm.questions.length === 0}>
                  {quizMode === 'external' ? '🔗 Create External Quiz' : 'Create Quiz'}
                </button>
                <button type="button" onClick={() => setShowCreateQuiz(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateAssignment(false)}>
          <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-heading mb-6">Create Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div><label className="label-text">Title</label>
                <input className="input-field" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} required /></div>
              <div><label className="label-text">Course</label>
                <select className="input-field" value={assignmentForm.courseId} onChange={e => setAssignmentForm({...assignmentForm, courseId: e.target.value})} required>
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select></div>
              <div><label className="label-text">Description</label>
                <textarea className="input-field" rows={3} value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Total Marks</label>
                  <input type="number" className="input-field" value={assignmentForm.totalMarks} onChange={e => setAssignmentForm({...assignmentForm, totalMarks: e.target.value})} /></div>
                <div><label className="label-text">Deadline</label>
                  <input type="datetime-local" className="input-field" value={assignmentForm.deadline} onChange={e => setAssignmentForm({...assignmentForm, deadline: e.target.value})} /></div>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowCreateAssignment(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
