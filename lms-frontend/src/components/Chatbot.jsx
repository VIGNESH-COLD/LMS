import { useState, useRef, useEffect } from 'react'
import { chatAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your RIT-LMS AI Assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  // Clear chat if user changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: "Hello! I'm your RIT-LMS AI Assistant. How can I help you today?" }])
    setIsOpen(false)
  }, [user?.id])

  const getSuggestedQuestions = () => {
    if (!user) return []
    switch (user.role) {
      case 'STUDENT':
        return [
          "What courses am I enrolled in?",
          "Show my timetable for today",
          "What are my internal marks?",
          "Any upcoming events?"
        ]
      case 'INSTRUCTOR':
        return [
          "What courses am I teaching?",
          "Show my timetable for today",
          "What are the upcoming events?",
          "How to upload course materials?"
        ]
      case 'ADMIN':
        return [
          "Show platform statistics",
          "List all departments",
          "Who are the faculty members?",
          "What is the system status?"
        ]
      default:
        return []
    }
  }

  const handleSend = async (text = input) => {
    if (!text.trim()) return

    const userMessage = { role: 'user', content: text }
    
    // Convert current messages to Ollama history format (excluding initial greeting if needed, or keeping it)
    const history = messages.filter(m => m.role !== 'system')
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await chatAPI.sendMessage(text, history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the AI service right now." }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white z-50 transition-all duration-300 transform hover:scale-110 active:scale-95 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-full max-w-[400px] h-[600px] max-h-[85vh] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right border border-gray-100 dark:border-white/10 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shadow-md relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-1.5 backdrop-blur-sm">
              <img src="/logo.png" alt="RIT AI" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">RIT Smart Assistant</h3>
              <p className="text-blue-100 text-[10px] uppercase tracking-wider">{user.role} MODE</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Region */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-surface-950 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-surface-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/10 rounded-bl-none'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 dark:prose-pre:bg-black/20 prose-pre:text-gray-800 dark:prose-pre:text-gray-200 prose-a:text-blue-500">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-surface-900 border border-gray-100 dark:border-white/10 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Region */}
        <div className="p-4 bg-white dark:bg-surface-900 border-t border-gray-100 dark:border-white/10">
          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {getSuggestedQuestions().map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-gray-200 dark:border-white/5"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-100 dark:bg-surface-800 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-transparent dark:border-white/5 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-blue-500/20"
            >
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
             <span className="text-[9px] text-gray-400 font-medium"></span>
          </div>
        </div>
      </div>
    </>
  )
}
