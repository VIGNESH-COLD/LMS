import { useState } from 'react'
import { achievementAPI, fileAPI } from '../services/api'

const ACADEMIC_YEARS = ['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027']
const AWARD_TYPES = ['Academic', 'Sports', 'Cultural', 'Technical', 'Social Service', 'Arts', 'Other']
const ACADEMIC_LEVELS = ['International', 'National', 'State', 'Regional', 'District', 'College']

const STATUS_STYLES = {
  PENDING:  { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', label: 'Pending Review' },
  APPROVED: { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400',  dot: 'bg-green-500',  label: 'Approved' },
  REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-700 dark:text-red-400',      dot: 'bg-red-500',    label: 'Rejected' },
}

const LEVEL_COLORS = {
  International: 'from-purple-500 to-indigo-600',
  National:      'from-blue-500 to-blue-700',
  State:         'from-cyan-500 to-blue-500',
  Regional:      'from-teal-500 to-cyan-600',
  District:      'from-green-500 to-teal-500',
  College:       'from-gray-400 to-gray-600',
}

const AWARD_ICONS = {
  Academic:       '🎓',
  Sports:         '🏅',
  Cultural:       '🎭',
  Technical:      '💻',
  'Social Service':'🤝',
  Arts:           '🎨',
  Other:          '🏆',
}

export default function AchievementsTab({ achievements, onSubmit }) {
  const [showForm, setShowForm] = useState(false)
  const [previewImg, setPreviewImg] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    academicYear: '2025-2026',
    eventDate: '',
    awardType: '',
    academicLevel: '',
    awardedBy: '',
    title: '',
    activeStatus: true,
  })
  const [certFile, setCertFile] = useState(null)
  const [certPreview, setCertPreview] = useState(null)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2 MB.')
      return
    }
    setError('')
    setCertFile(file)
    setCertPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.title.trim()) return setError('Title of the Award is required.')
    if (!form.awardType) return setError('Award Type is required.')
    if (!form.academicLevel) return setError('Achievement Academic Level is required.')
    if (!form.awardedBy.trim()) return setError('Awarded By is required.')
    if (!form.eventDate) return setError('Date is required.')
    if (!certFile) return setError('Certificate upload is required.')

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('awardType', form.awardType)
      fd.append('academicLevel', form.academicLevel)
      fd.append('awardedBy', form.awardedBy)
      fd.append('academicYear', form.academicYear)
      fd.append('eventDate', form.eventDate)
      if (certFile) fd.append('certificate', certFile)

      await achievementAPI.submitAchievement(fd)
      setSuccess('Achievement submitted successfully! It will be reviewed by admin.')
      setForm({ academicYear: '2025-2026', eventDate: '', awardType: '', academicLevel: '', awardedBy: '', title: '', activeStatus: true })
      setCertFile(null)
      setCertPreview(null)
      setShowForm(false)
      await onSubmit()
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this achievement submission?')) return
    try {
      await achievementAPI.delete(id)
      await onSubmit()
    } catch {
      alert('Failed to delete.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-heading">🏆 My Achievements</h2>
          <p className="text-xs text-muted mt-1">Submit and track your academic & extracurricular achievements</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError(''); setSuccess('') }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white
                     bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                     shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          {showForm ? '✕ Cancel' : '＋ Submit Achievement'}
        </button>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium">
          <span className="text-lg">✅</span> {success}
        </div>
      )}

      {/* Submission Form */}
      {showForm && (
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
            <span className="text-xl">ℹ️</span>
            <span className="font-bold text-sm tracking-wide">Achievements</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Row 1: Academic Year + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="form-label">Academic Year</label>
                <div className="relative">
                  <select
                    name="academicYear"
                    value={form.academicYear}
                    onChange={handleChange}
                    className="form-select w-full"
                  >
                    {ACADEMIC_YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="form-label">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                  className="form-input w-full"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Row 2: Award Type + Academic Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="form-label">Award Type <span className="text-red-500">*</span></label>
                <select
                  name="awardType"
                  value={form.awardType}
                  onChange={handleChange}
                  className="form-select w-full"
                >
                  <option value="">Select</option>
                  {AWARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="form-label">Achievements Academic Level <span className="text-red-500">*</span></label>
                <select
                  name="academicLevel"
                  value={form.academicLevel}
                  onChange={handleChange}
                  className="form-select w-full"
                >
                  <option value="">Select</option>
                  {ACADEMIC_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3: Awarded By */}
            <div className="space-y-1.5">
              <label className="form-label">Awarded By <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="awardedBy"
                value={form.awardedBy}
                onChange={handleChange}
                placeholder="e.g. Anna University, VIT, Sports Authority of India..."
                className="form-input w-full"
              />
            </div>

            {/* Row 4: Title of Award */}
            <div className="space-y-1.5">
              <label className="form-label text-blue-600 dark:text-blue-400 font-bold">Title of the Award <span className="text-red-500">*</span></label>
              <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30">
                {/* Minimal toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                  <button type="button" onClick={() => document.execCommand('bold')} title="Bold"
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-white/10 font-bold text-sm text-gray-700 dark:text-gray-300">B</button>
                  <button type="button" onClick={() => document.execCommand('italic')} title="Italic"
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-white/10 italic text-sm text-gray-700 dark:text-gray-300">I</button>
                  <button type="button" onClick={() => document.execCommand('underline')} title="Underline"
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-white/10 underline text-sm text-gray-700 dark:text-gray-300">U</button>
                  <div className="w-px h-5 bg-gray-300 dark:bg-white/20 mx-1" />
                  <button type="button" onClick={() => document.execCommand('insertUnorderedList')} title="Bullet List"
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-white/10 text-sm text-gray-700 dark:text-gray-300">≡</button>
                </div>
                <div
                  id="award-title-editor"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setForm(f => ({ ...f, title: e.currentTarget.innerText }))}
                  className="min-h-[80px] p-4 text-sm text-gray-800 dark:text-gray-200 outline-none bg-white dark:bg-transparent"
                  style={{ lineHeight: '1.6' }}
                  data-placeholder="Enter the full title of your award / achievement..."
                />
              </div>
              <style>{`
                [contenteditable]:empty:before {
                  content: attr(data-placeholder);
                  color: #9ca3af;
                  pointer-events: none;
                }
              `}</style>
            </div>

            {/* Row 5: Certificate Upload + Active Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-1.5">
                <label className="form-label">Upload Certificate <span className="text-red-500">*</span></label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    Choose file
                  </span>
                  <span className="text-sm text-muted truncate max-w-[160px]">
                    {certFile ? certFile.name : 'No file chosen'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <p className="text-[11px] text-red-500 font-medium">image (max 2 mb)</p>
                {certPreview && (
                  <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-300 dark:border-blue-700 shadow-md group cursor-pointer"
                    onClick={() => setPreviewImg(certPreview)}>
                    <img src={certPreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">Preview</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Active Status</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, activeStatus: !f.activeStatus }))}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      form.activeStatus ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                      form.activeStatus ? 'translate-x-8' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className={`text-sm font-bold ${form.activeStatus ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}>
                    {form.activeStatus ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-2.5 rounded-xl font-bold text-sm text-white
                           bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800
                           shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : 'submit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Achievements List */}
      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-card text-center">
          <div className="text-6xl mb-4">🏅</div>
          <h3 className="text-lg font-bold text-heading mb-2">No Achievements Yet</h3>
          <p className="text-sm text-muted max-w-sm">
            Submit your first achievement using the button above. Your submissions will appear here after review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {achievements.map(a => {
            const st = STATUS_STYLES[a.status] || STATUS_STYLES.PENDING
            const grad = LEVEL_COLORS[a.academicLevel] || 'from-gray-400 to-gray-600'
            const icon = AWARD_ICONS[a.awardType] || '🏆'
            const certUrl = a.certificateFileName ? fileAPI.getUrl(a.certificateFileName) : null
            return (
              <div key={a.id}
                className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                {/* Card top gradient strip */}
                <div className={`h-1.5 bg-gradient-to-r ${grad}`} />

                <div className="p-5 space-y-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-heading leading-snug line-clamp-2">{a.title}</h3>
                        {a.awardType && (
                          <span className="text-[10px] text-muted uppercase tracking-wider">{a.awardType}</span>
                        )}
                      </div>
                    </div>
                    {/* Status badge */}
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {a.academicLevel && (
                      <div>
                        <p className="text-[10px] text-muted uppercase tracking-wider">Level</p>
                        <p className="font-semibold text-heading">{a.academicLevel}</p>
                      </div>
                    )}
                    {a.academicYear && (
                      <div>
                        <p className="text-[10px] text-muted uppercase tracking-wider">Academic Year</p>
                        <p className="font-semibold text-heading">{a.academicYear}</p>
                      </div>
                    )}
                    {a.awardedBy && (
                      <div className="col-span-2">
                        <p className="text-[10px] text-muted uppercase tracking-wider">Awarded By</p>
                        <p className="font-semibold text-heading truncate">{a.awardedBy}</p>
                      </div>
                    )}
                    {a.eventDate && (
                      <div>
                        <p className="text-[10px] text-muted uppercase tracking-wider">Date</p>
                        <p className="font-semibold text-heading">
                          {new Date(a.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Certificate + Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                    {certUrl ? (
                      <button
                        onClick={() => setPreviewImg(certUrl)}
                        className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        📄 View Certificate
                      </button>
                    ) : (
                      <span className="text-xs text-muted italic">No certificate</span>
                    )}
                    {a.status === 'PENDING' && (
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>

                  {/* Rejection note */}
                  {a.status === 'REJECTED' && (
                    <div className="text-[11px] text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
                      ⚠️ This submission was rejected. Please review and resubmit if needed.
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImg(null)}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white text-gray-900 font-bold text-lg flex items-center justify-center shadow-xl hover:bg-gray-100 z-10"
            >✕</button>
            <img
              src={previewImg}
              alt="Certificate"
              className="w-full h-full object-contain rounded-2xl shadow-2xl max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
