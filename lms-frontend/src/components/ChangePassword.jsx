import { useState } from 'react'
import { authAPI } from '../services/api'

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match')
    }

    if (form.newPassword.length < 6) {
      return setError('New password must be at least 6 characters')
    }

    setLoading(true)
    try {
      await authAPI.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      })
      setSuccess('Password updated successfully!')
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="glass-card p-8 animate-fade-in shadow-xl shadow-blue-500/5">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading">Change Password</h2>
            <p className="text-xs text-sub">Update your account security</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Current Password</label>
            <input 
              type="password" 
              value={form.oldPassword} 
              onChange={e => setForm({...form, oldPassword: e.target.value})}
              className="input-field" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-white/5 mt-4">
            <label className="label-text">New Password</label>
            <input 
              type="password" 
              value={form.newPassword} 
              onChange={e => setForm({...form, newPassword: e.target.value})}
              className="input-field" 
              placeholder="••••••••" 
              required 
              minLength={6}
            />
          </div>

          <div>
            <label className="label-text">Confirm New Password</label>
            <input 
              type="password" 
              value={form.confirmPassword} 
              onChange={e => setForm({...form, confirmPassword: e.target.value})}
              className="input-field" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full !py-3 text-base mt-2 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Updating...</span>
              </>
            ) : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
