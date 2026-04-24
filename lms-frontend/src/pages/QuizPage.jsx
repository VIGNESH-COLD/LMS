import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quizAPI, submissionAPI } from '../services/api'

export default function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [showTimesUp, setShowTimesUp] = useState(false)
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(3)
  const timerRef = useRef(null)
  const autoSubmitRef = useRef(null)

  useEffect(() => {
    loadQuiz()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (autoSubmitRef.current) clearInterval(autoSubmitRef.current)
    }
  }, [id])

  const loadQuiz = async () => {
    try {
      const res = await quizAPI.getById(id)
      setQuiz(res.data)
      if (res.data.durationMinutes) {
        setTimeLeft(res.data.durationMinutes * 60)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // Timer
  useEffect(() => {
    if (timeLeft === null || result || showTimesUp) return
    if (timeLeft <= 0) {
      // Show Time's Up popup instead of immediately submitting
      setShowTimesUp(true)
      return
    }
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft, result, showTimesUp])

  // Auto-submit countdown after Time's Up popup
  useEffect(() => {
    if (!showTimesUp) return
    setAutoSubmitCountdown(3)
    autoSubmitRef.current = setInterval(() => {
      setAutoSubmitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(autoSubmitRef.current)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(autoSubmitRef.current)
  }, [showTimesUp])

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    if (autoSubmitRef.current) clearInterval(autoSubmitRef.current)
    try {
      const res = await submissionAPI.submitQuiz({ quizId: parseInt(id), answers })
      setResult(res.data)
      setShowTimesUp(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>
  if (!quiz) return <div className="page-container text-center"><p className="text-sub">Quiz not found</p></div>

  // Result view
  if (result) {
    const percentage = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0
    return (
      <div className="page-container max-w-2xl mx-auto">
        <div className="glass-card p-10 text-center animate-slide-up">
          <div className="text-6xl mb-6">{percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '📚'}</div>
          <h1 className="text-3xl font-bold text-heading mb-2">Quiz Completed!</h1>
          <p className="text-sub mb-8">{quiz.title}</p>

          <div className="w-40 h-40 mx-auto mb-8 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="3" />
              <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                fill="none" stroke="url(#gradient)" strokeWidth="3"
                strokeDasharray={`${percentage}, 100`} strokeLinecap="round" />
              <defs>
                <linearGradient id="gradient"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#d946ef" /></linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className="text-3xl font-bold text-heading">{percentage}%</div>
                <div className="text-xs text-sub">{result.score}/{result.totalMarks}</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button onClick={() => navigate('/results')} className="btn-primary">View All Results</button>
            <button onClick={() => navigate(-1)} className="btn-secondary">Back to Course</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Time's Up Modal */}
      {showTimesUp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="glass-card p-10 max-w-md w-full text-center animate-slide-up">
            <div className="text-7xl mb-4 animate-bounce">⏰</div>
            <h2 className="text-3xl font-bold text-red-500 dark:text-red-400 mb-3">Time's Up!</h2>
            <p className="text-sub mb-6">Your quiz will be auto-submitted with your current answers.</p>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-red-500 dark:text-red-400 font-mono">{autoSubmitCountdown}</span>
              </div>
              <p className="text-xs text-muted mt-2">Auto-submitting in {autoSubmitCountdown}s...</p>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
              {submitting ? 'Submitting...' : 'Submit Now'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-heading truncate">{quiz.title}</h1>
            <p className="text-sub text-xs sm:text-sm mt-1">{quiz.questions?.length} questions • {quiz.totalMarks} marks total</p>
          </div>
          {timeLeft !== null && (
            <div className={`text-xl sm:text-2xl font-mono font-bold px-3 sm:px-4 py-2 rounded-xl self-start sm:self-auto flex-shrink-0 ${timeLeft < 60 ? 'text-red-500 dark:text-red-400 bg-red-500/10 animate-pulse' : 'text-primary-500 dark:text-primary-400 bg-primary-500/10'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-8">
        {quiz.questions?.map((question, i) => (
          <div key={question.id} className="glass-card p-6 animate-slide-up" style={{animationDelay: `${i * 0.05}s`}}>
            <div className="flex items-start space-x-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-primary-500 dark:text-primary-400">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-heading font-medium">{question.text}</p>
                <p className="text-xs text-muted mt-1">{question.marks} marks • {question.type}</p>
              </div>
            </div>

            {question.type === 'MCQ' && question.options ? (
              <div className="space-y-2 ml-11">
                {question.options.map((option, j) => (
                  <div key={j}
                    onClick={() => handleAnswer(question.id, option)}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                      ${answers[question.id] === option
                        ? 'bg-primary-500/15 border border-primary-500/30'
                        : 'bg-gray-100 dark:bg-white/5 border border-transparent hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                      ${answers[question.id] === option ? 'border-primary-500 bg-primary-500' : 'border-gray-400 dark:border-surface-400'}`}>
                      {answers[question.id] === option && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-surface-300">{option}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ml-11">
                <textarea className="input-field" rows={3} placeholder="Type your answer..."
                  value={answers[question.id] || ''}
                  onChange={e => handleAnswer(question.id, e.target.value)} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sub text-xs sm:text-sm">
          Answered {Object.keys(answers).length} of {quiz.questions?.length} questions
        </p>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  )
}
