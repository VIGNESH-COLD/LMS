import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()

  const features = [
    { icon: '📚', title: 'Course Management', desc: 'Create and organize courses with modules, materials, PDFs, and video links.' },
    { icon: '📝', title: 'Assessments', desc: 'Build MCQ quizzes and assignments with auto-grading and deadline tracking.' },
    { icon: '📊', title: 'Analytics', desc: 'Track student performance with detailed score reports and insights.' },
    { icon: '🔒', title: 'Secure Access', desc: 'Role-based authentication for admins, faculty, and students.' },
    { icon: '📁', title: 'File Uploads', desc: 'Upload PDFs, documents, and link videos to your course content.' },
    { icon: '🤖', title: 'AI-Ready', desc: 'Scalable architecture designed for future AI-based learning analytics.' },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'1.5s'}}></div>
        <div className="absolute bottom-20 right-1/4 w-60 h-60 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'3s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-primary-600 dark:text-primary-300 font-medium">Learning Management System</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-surface-200 dark:to-surface-400 bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
              Learning Experience
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-surface-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{animationDelay:'0.15s'}}>
            A modern platform for faculty to create courses and assessments,
            and for students to learn and grow — all in one centralized system.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{animationDelay:'0.3s'}}>
            <Link to={user ? (user.role === 'INSTRUCTOR' ? '/instructor' : '/student') : '/login'}
              className="btn-primary text-lg !py-3.5 !px-8 flex items-center space-x-2">
              <span>{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="#features" className="btn-secondary text-lg !py-3.5 !px-8">
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-20 animate-slide-up" style={{animationDelay:'0.45s'}}>
            {[
              { value: '100+', label: 'Courses' },
              { value: '5K+', label: 'Students' },
              { value: '10K+', label: 'Assessments' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-surface-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-500 dark:text-surface-400 text-lg max-w-xl mx-auto">
              A comprehensive platform built for modern education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={feature.title}
                className="glass-card-hover p-6 animate-slide-up"
                style={{animationDelay: `${i * 0.1}s`}}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-heading mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-surface-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-gray-500 dark:text-surface-400 text-lg mb-8">
              Join thousands of students and faculty on LMS Pro.
            </p>
            <Link to="/login" className="btn-primary text-lg !py-3.5 !px-8 inline-flex items-center space-x-2">
              <span>Create Account</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/5 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-500 dark:text-surface-500 text-sm">
          <p>© 2026 LMS Pro — Learning Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
