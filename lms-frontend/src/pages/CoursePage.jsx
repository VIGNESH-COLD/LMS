import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { courseAPI, quizAPI, assignmentAPI, submissionAPI, fileAPI } from '../services/api'

export default function CoursePage() {
  const { id } = useParams()
  const { user, isInstructor, isStudent } = useAuth()
  const [course, setCourse] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [assignments, setAssignments] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddMaterial, setShowAddMaterial] = useState(null)
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', orderIndex: 1 })
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'PDF', url: '' })
  const [uploading, setUploading] = useState(false)

  // Assignment states
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [showEditAssignment, setShowEditAssignment] = useState(null)
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', totalMarks: 100, deadline: '', filePath: '' })
  const [assignmentFile, setAssignmentFile] = useState(null)
  const [assignmentUploading, setAssignmentUploading] = useState(false)

  // Student submission states
  const [submissionFile, setSubmissionFile] = useState(null)
  const [submittingId, setSubmittingId] = useState(null)
  const [submitUploading, setSubmitUploading] = useState(false)

  // Instructor view submissions
  const [viewSubmissions, setViewSubmissions] = useState(null)
  const [submissions, setSubmissions] = useState([])

  useEffect(() => { loadCourse() }, [id])

  const loadCourse = async () => {
    try {
      const [courseRes, quizRes, assignRes] = await Promise.all([
        courseAPI.getById(id),
        quizAPI.getByCourse(id),
        assignmentAPI.getByCourse(id),
      ])
      setCourse(courseRes.data)
      setQuizzes(quizRes.data)
      setAssignments(assignRes.data)

      if (isStudent) {
        try {
          const enrollRes = await courseAPI.checkEnrollment(id)
          setEnrolled(enrollRes.data.enrolled)
        } catch { setEnrolled(false) }
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleEnroll = async () => {
    try { await courseAPI.enroll(id); setEnrolled(true); loadCourse() }
    catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  const handleAddModule = async (e) => {
    e.preventDefault()
    try {
      await courseAPI.addModule(id, moduleForm)
      setModuleForm({ title: '', description: '', orderIndex: (course?.modules?.length || 0) + 1 })
      setShowAddModule(false)
      loadCourse()
    } catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await fileAPI.upload(file)
      setMaterialForm({
        ...materialForm,
        url: fileAPI.getUrl(res.data.fileName),
        title: materialForm.title || file.name,
      })
    } catch (err) { alert('Upload failed') }
    finally { setUploading(false) }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    try {
      await courseAPI.addMaterial(showAddMaterial, materialForm)
      setMaterialForm({ title: '', type: 'PDF', url: '' })
      setShowAddMaterial(null)
      loadCourse()
    } catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  // ---- ASSIGNMENT HANDLERS ----

  const handleAssignmentFileUpload = async (file) => {
    if (!file) return null
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5 MB')
      return null
    }
    try {
      const res = await fileAPI.upload(file)
      return fileAPI.getUrl(res.data.fileName)
    } catch { alert('File upload failed'); return null }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    setAssignmentUploading(true)
    try {
      let filePath = assignmentForm.filePath
      if (assignmentFile) {
        const uploaded = await handleAssignmentFileUpload(assignmentFile)
        if (uploaded) filePath = uploaded
      }
      await assignmentAPI.create({
        title: assignmentForm.title,
        description: assignmentForm.description,
        courseId: parseInt(id),
        totalMarks: parseInt(assignmentForm.totalMarks),
        deadline: assignmentForm.deadline || null,
        filePath,
      })
      setAssignmentForm({ title: '', description: '', totalMarks: 100, deadline: '', filePath: '' })
      setAssignmentFile(null)
      setShowCreateAssignment(false)
      loadCourse()
    } catch (err) { alert(err.response?.data?.error || 'Failed to create assignment') }
    finally { setAssignmentUploading(false) }
  }

  const handleEditAssignment = async (e) => {
    e.preventDefault()
    setAssignmentUploading(true)
    try {
      let filePath = assignmentForm.filePath
      if (assignmentFile) {
        const uploaded = await handleAssignmentFileUpload(assignmentFile)
        if (uploaded) filePath = uploaded
      }
      await assignmentAPI.update(showEditAssignment.id, {
        title: assignmentForm.title,
        description: assignmentForm.description,
        courseId: parseInt(id),
        totalMarks: parseInt(assignmentForm.totalMarks),
        deadline: assignmentForm.deadline || null,
        filePath,
      })
      setAssignmentForm({ title: '', description: '', totalMarks: 100, deadline: '', filePath: '' })
      setAssignmentFile(null)
      setShowEditAssignment(null)
      loadCourse()
    } catch (err) { alert(err.response?.data?.error || 'Failed to update assignment') }
    finally { setAssignmentUploading(false) }
  }

  const handleDeleteAssignment = async (asnId) => {
    if (!confirm('Delete this assignment? All student submissions will be lost.')) return
    try { await assignmentAPI.delete(asnId); loadCourse() }
    catch (err) { alert(err.response?.data?.error || 'Failed') }
  }

  const openEditAssignment = (asn) => {
    setAssignmentForm({
      title: asn.title,
      description: asn.description || '',
      totalMarks: asn.totalMarks || 100,
      deadline: asn.deadline ? asn.deadline.slice(0, 16) : '',
      filePath: asn.filePath || '',
    })
    setAssignmentFile(null)
    setShowEditAssignment(asn)
  }

  // ---- STUDENT SUBMISSION ----

  const handleStudentSubmit = async (assignmentId) => {
    if (!submissionFile) { alert('Please select a file to upload'); return }
    if (submissionFile.size > 5 * 1024 * 1024) { alert('File must be less than 5 MB'); return }
    setSubmitUploading(true)
    try {
      const uploadedPath = await handleAssignmentFileUpload(submissionFile)
      if (!uploadedPath) return
      await submissionAPI.submitAssignment({
        assignmentId,
        content: 'File submission',
        filePath: uploadedPath,
      })
      setSubmissionFile(null)
      setSubmittingId(null)
      loadCourse()
      alert('Assignment submitted successfully!')
    } catch (err) { alert(err.response?.data?.error || 'Submission failed') }
    finally { setSubmitUploading(false) }
  }

  // ---- INSTRUCTOR VIEW SUBMISSIONS ----

  const handleViewSubmissions = async (asnId) => {
    if (viewSubmissions === asnId) { setViewSubmissions(null); return }
    try {
      const res = await submissionAPI.getAssignmentSubmissions(asnId)
      setSubmissions(res.data)
      setViewSubmissions(asnId)
    } catch (err) { alert('Failed to load submissions') }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>
  if (!course) return <div className="page-container text-center"><p className="text-sub">Course not found</p></div>

  const isOwner = isInstructor && course.instructorId === user?.id

  return (
    <div className="page-container">
      {/* Header */}
      <div className="glass-card p-4 sm:p-8 mb-6 sm:mb-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="badge-primary">Course</span>
              <span className="badge-accent">{course.moduleCount} modules</span>
              <span className="badge-success">{course.studentCount} students</span>
            </div>
            <h1 className="text-3xl font-bold text-heading mb-2">{course.title}</h1>
            <p className="text-sub mb-2">{course.description}</p>
            <p className="text-sm text-muted">Faculty: {course.instructorName}</p>
          </div>
          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
            {isStudent && !enrolled && (
              <button onClick={handleEnroll} className="btn-primary">Enroll in Course</button>
            )}
            {isStudent && enrolled && (
              <span className="badge-success text-sm py-2 px-4">✓ Enrolled</span>
            )}
            {isOwner && (
              <button onClick={() => setShowAddModule(true)} className="btn-primary text-sm">+ Add Module</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modules & Materials */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="section-title">Course Content</h2>
          {course.modules?.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-sub">No modules yet</p>
            </div>
          ) : course.modules?.map((mod, i) => (
            <div key={mod.id} className="glass-card overflow-hidden animate-slide-up" style={{animationDelay: `${i * 0.1}s`}}>
              <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-primary-500 dark:text-primary-400">
                    {mod.orderIndex}
                  </div>
                  <div>
                    <h3 className="font-semibold text-heading">{mod.title}</h3>
                    {mod.description && <p className="text-xs text-sub">{mod.description}</p>}
                  </div>
                </div>
                {isOwner && (
                  <button onClick={() => setShowAddMaterial(mod.id)} className="text-xs text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">+ Material</button>
                )}
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {mod.materials?.map(mat => (
                  <a key={mat.id} href={mat.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <span className="text-lg">
                      {mat.type === 'PDF' ? '📄' : mat.type === 'VIDEO' ? '🎬' : '📝'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-heading">{mat.title}</p>
                      <p className="text-xs text-muted">{mat.type}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 dark:text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
                {(!mod.materials || mod.materials.length === 0) && (
                  <p className="px-5 py-3 text-xs text-muted">No materials yet</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quizzes */}
          <div>
            <h3 className="text-lg font-semibold text-heading mb-3">📝 Quizzes</h3>
            {quizzes.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <p className="text-sub text-sm">No quizzes</p>
              </div>
            ) : quizzes.map(quiz => (
              <div key={quiz.id} className="glass-card-hover p-4 mb-3">
                <h4 className="font-medium text-heading mb-1">{quiz.title}</h4>
                <div className="flex items-center space-x-2 text-xs text-sub mb-3">
                  <span>{quiz.totalMarks} marks</span>
                  <span>•</span>
                  <span>{quiz.durationMinutes} min</span>
                  {quiz.externalUrl && (
                    <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-medium">🔗 External</span>
                  )}
                </div>
                {isStudent && enrolled && (
                  quiz.externalUrl ? (
                    <a href={quiz.externalUrl} target="_blank" rel="noopener noreferrer"
                      className="btn-primary w-full text-sm !py-1.5 block text-center">
                      🔗 Open Quiz
                    </a>
                  ) : (
                    <Link to={`/quiz/${quiz.id}`} className="btn-primary w-full text-sm !py-1.5 block text-center">
                      Take Quiz
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Assignments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-heading">📋 Assignments</h3>
              {isOwner && (
                <button onClick={() => { setAssignmentForm({ title: '', description: '', totalMarks: 100, deadline: '', filePath: '' }); setAssignmentFile(null); setShowCreateAssignment(true) }}
                  className="text-xs bg-primary-500 text-white px-3 py-1 rounded-lg hover:bg-primary-600 transition-colors">+ New</button>
              )}
            </div>
            {assignments.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <p className="text-sub text-sm">No assignments</p>
              </div>
            ) : assignments.map(asn => (
              <div key={asn.id} className="glass-card p-4 mb-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-heading mb-1">{asn.title}</h4>
                  {isOwner && (
                    <div className="flex space-x-2 flex-shrink-0 ml-2">
                      <button onClick={() => openEditAssignment(asn)} className="text-blue-500 hover:text-blue-600 text-xs">Edit</button>
                      <button onClick={() => handleDeleteAssignment(asn.id)} className="text-red-500 hover:text-red-600 text-xs">Delete</button>
                    </div>
                  )}
                </div>
                {asn.description && <p className="text-xs text-sub mb-1">{asn.description}</p>}
                <p className="text-xs text-sub mb-1">{asn.totalMarks} marks</p>
                {asn.deadline && (
                  <p className="text-xs text-muted mb-2">Due: {new Date(asn.deadline).toLocaleDateString()}</p>
                )}

                {/* Faculty-uploaded assignment file */}
                {asn.filePath && (
                  <a href={asn.filePath} target="_blank" rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg mb-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <span>📄</span>
                    <span className="font-medium">Download Assignment File</span>
                    <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                )}

                {/* Student Submit Button */}
                {isStudent && enrolled && !asn.submitted && (
                  <div className="mt-3">
                    {submittingId === asn.id ? (
                      <div className="space-y-2 bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                        <p className="text-xs font-medium text-heading">📤 Upload your submission (max 5 MB)</p>
                        <input
                          type="file"
                          onChange={(e) => setSubmissionFile(e.target.files[0])}
                          className="w-full text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary-500 file:text-white hover:file:bg-primary-400 cursor-pointer"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.jpg,.png"
                        />
                        {submissionFile && (
                          <div className="flex items-center justify-between text-xs text-sub">
                            <span className="truncate">{submissionFile.name}</span>
                            <span>{(submissionFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStudentSubmit(asn.id)}
                            disabled={!submissionFile || submitUploading}
                            className="btn-primary text-xs !py-1.5 flex-1 disabled:opacity-50">
                            {submitUploading ? 'Submitting...' : 'Submit'}
                          </button>
                          <button onClick={() => { setSubmittingId(null); setSubmissionFile(null) }}
                            className="btn-secondary text-xs !py-1.5 flex-1">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setSubmittingId(asn.id)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors">
                        📤 Submit Assignment
                      </button>
                    )}
                  </div>
                )}

                {isStudent && asn.submitted && (
                  <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium px-3 py-2 rounded-lg text-center">
                    ✅ Submitted
                  </div>
                )}

                {/* Instructor: View Submissions */}
                {isOwner && (
                  <div className="mt-3">
                    <button onClick={() => handleViewSubmissions(asn.id)}
                      className="w-full text-xs bg-gray-100 dark:bg-white/10 text-heading hover:bg-gray-200 dark:hover:bg-white/15 py-2 px-3 rounded-lg transition-colors font-medium">
                      {viewSubmissions === asn.id ? '▼ Hide Submissions' : '▶ View Submissions'}
                    </button>
                    {viewSubmissions === asn.id && (
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {submissions.length === 0 ? (
                          <p className="text-xs text-muted italic text-center py-3">No submissions yet</p>
                        ) : submissions.map(sub => (
                          <div key={sub.id} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-heading truncate">{sub.studentName}</p>
                              <p className="text-[10px] text-muted">{new Date(sub.submittedAt).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              {sub.filePath && (
                                <a href={sub.filePath} target="_blank" rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600 text-xs font-medium">⬇ File</a>
                              )}
                              {sub.graded ? (
                                <span className="text-xs font-bold text-emerald-600">{sub.score}/{sub.totalMarks}</span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded font-medium">Pending</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModule(false)}>
          <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-heading mb-6">Add Module</h2>
            <form onSubmit={handleAddModule} className="space-y-4">
              <div><label className="label-text">Title</label>
                <input className="input-field" value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} required /></div>
              <div><label className="label-text">Description</label>
                <textarea className="input-field" rows={2} value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})} /></div>
              <div><label className="label-text">Order</label>
                <input type="number" className="input-field" value={moduleForm.orderIndex} onChange={e => setModuleForm({...moduleForm, orderIndex: parseInt(e.target.value)})} /></div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Add</button>
                <button type="button" onClick={() => setShowAddModule(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddMaterial(null)}>
          <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-heading mb-6">Add Material</h2>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div><label className="label-text">Title</label>
                <input className="input-field" value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} required /></div>
              <div><label className="label-text">Type</label>
                <select className="input-field" value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value})}>
                  <option value="PDF">PDF</option><option value="VIDEO">Video Link</option><option value="DOCUMENT">Document</option>
                </select></div>
              {materialForm.type === 'VIDEO' ? (
                <div><label className="label-text">Video URL</label>
                  <input className="input-field" value={materialForm.url} onChange={e => setMaterialForm({...materialForm, url: e.target.value})} placeholder="https://youtube.com/..." required /></div>
              ) : (
                <div>
                  <label className="label-text">Upload File</label>
                  <input type="file" onChange={handleFileUpload} className="input-field text-sm" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                  {uploading && <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">Uploading...</p>}
                  {materialForm.url && !uploading && <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">✓ File uploaded</p>}
                </div>
              )}
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1" disabled={!materialForm.url || uploading}>Add</button>
                <button type="button" onClick={() => setShowAddMaterial(null)} className="btn-secondary flex-1">Cancel</button>
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
              <div><label className="label-text">Description</label>
                <textarea className="input-field" rows={2} value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Total Marks</label>
                  <input type="number" className="input-field" value={assignmentForm.totalMarks} onChange={e => setAssignmentForm({...assignmentForm, totalMarks: e.target.value})} /></div>
                <div><label className="label-text">Deadline</label>
                  <input type="datetime-local" className="input-field" value={assignmentForm.deadline} onChange={e => setAssignmentForm({...assignmentForm, deadline: e.target.value})} /></div>
              </div>
              <div>
                <label className="label-text">Attach File (max 5 MB)</label>
                <input type="file" onChange={(e) => setAssignmentFile(e.target.files[0])}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary-500 file:text-white hover:file:bg-primary-400 cursor-pointer input-field"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.jpg,.png" />
                {assignmentFile && (
                  <p className="text-xs text-sub mt-1">{assignmentFile.name} ({(assignmentFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1" disabled={assignmentUploading}>
                  {assignmentUploading ? 'Creating...' : 'Create Assignment'}
                </button>
                <button type="button" onClick={() => setShowCreateAssignment(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {showEditAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditAssignment(null)}>
          <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-heading mb-6">Edit Assignment</h2>
            <form onSubmit={handleEditAssignment} className="space-y-4">
              <div><label className="label-text">Title</label>
                <input className="input-field" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} required /></div>
              <div><label className="label-text">Description</label>
                <textarea className="input-field" rows={2} value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Total Marks</label>
                  <input type="number" className="input-field" value={assignmentForm.totalMarks} onChange={e => setAssignmentForm({...assignmentForm, totalMarks: e.target.value})} /></div>
                <div><label className="label-text">Deadline</label>
                  <input type="datetime-local" className="input-field" value={assignmentForm.deadline} onChange={e => setAssignmentForm({...assignmentForm, deadline: e.target.value})} /></div>
              </div>
              <div>
                <label className="label-text">Replace File (max 5 MB, optional)</label>
                {assignmentForm.filePath && (
                  <p className="text-xs text-emerald-500 mb-1">✓ Current file attached</p>
                )}
                <input type="file" onChange={(e) => setAssignmentFile(e.target.files[0])}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary-500 file:text-white hover:file:bg-primary-400 cursor-pointer input-field"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.jpg,.png" />
                {assignmentFile && (
                  <p className="text-xs text-sub mt-1">{assignmentFile.name} ({(assignmentFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1" disabled={assignmentUploading}>
                  {assignmentUploading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowEditAssignment(null)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
