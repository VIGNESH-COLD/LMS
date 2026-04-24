import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import Carousel from '../components/Carousel'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login({ email: form.email, password: form.password })
      login(res.data)
      navigate(res.data.role === 'INSTRUCTOR' ? '/instructor' : res.data.role === 'ADMIN' ? '/admin' : '/student')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-gray-50 dark:bg-surface-950">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white dark:bg-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 min-h-[700px]">
        
        {/* Carousel Section - Left (Hidden on Mobile) */}
        <div className="hidden lg:block w-7/12 p-6">
          <Carousel />
        </div>

        {/* Login Form Section - Right */}
        <div className="w-full lg:w-5/12 p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
          {/* Background Accents for Form Side */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

          <div className="relative z-10 w-full max-w-sm mx-auto">
            {/* Logo & Header */}
            <div className="mb-10 text-center lg:text-left">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:ml-0 overflow-hidden shadow-xl shadow-blue-500/20">
                <img src="/logo.png" alt="RIT Logo" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <h1 className="text-3xl font-black text-heading leading-tight mb-2">
                RIT-LMS <span className="text-primary-500 tracking-tighter"></span>
              </h1>
              <p className="text-sub font-medium">
                Academic Portal Login
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-sm rounded-2xl px-5 py-4 mb-6 flex items-center animate-shake">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <input 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange}
                    className="input-field pl-12 group-focus-within:border-primary-500 transition-colors" 
                    placeholder="name@rit.edu" 
                    required 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                </div>
                <div className="relative group">
                  <input 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={form.password} 
                    onChange={handleChange}
                    className="input-field pl-12 pr-12 group-focus-within:border-primary-500 transition-colors" 
                    placeholder="••••••••" 
                    required 
                    minLength={6} 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full !py-4 text-sm font-black uppercase tracking-widest mt-4 shadow-xl shadow-primary-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span>Authenticating...</span>
                  </span>
                ) : 'Launch Portal'}
              </button>
            </form>

            <div className="mt-12 text-center border-t border-gray-100 dark:border-white/5 pt-8">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

