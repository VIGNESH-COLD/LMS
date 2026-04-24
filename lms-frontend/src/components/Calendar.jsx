import { useState } from 'react'

export default function Calendar() {
  const [currentDate] = useState(new Date(2026, 2, 11)) // March 11, 2026
  
  const daysInMonth = 31
  const firstDayOfMonth = 0 // Sunday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthName = "March 2026"

  return (
    <div className="dashboard-card animate-in" style={{animationDelay: '0.2s'}}>
      <div className="p-4 flex items-center space-x-6 border-b border-gray-100 dark:border-white/5">
        <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">{monthName}</h3>
        
        <div className="flex items-center space-x-6 ml-auto">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-pink-200 dark:bg-pink-900/40 rounded-sm"></div>
            <span className="text-[10px] text-gray-500 uppercase">Holiday</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#BADCFB] dark:bg-blue-900/40 rounded-sm"></div>
            <span className="text-[10px] text-gray-500 uppercase">No order Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[#14A1B3] rounded-sm"></div>
            <span className="text-[10px] text-gray-500 uppercase">Today</span>
          </div>
        </div>
      </div>

      <div className="calendar-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-header-day border-r border-white/20 last:border-0 font-bold uppercase tracking-widest text-[11px]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-l border-t border-gray-100 dark:border-white/5">
        {blanks.map(i => (
          <div key={`blank-${i}`} className="calendar-day border-r border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/10"></div>
        ))}
        {days.map(day => {
          const isToday = day === 11;
          const isHoliday = day === 8 || day === 15 || day === 22 || day === 29; // Sundays
          
          return (
            <div 
              key={day} 
              className={`calendar-day border-r border-b border-gray-100 dark:border-white/5 flex flex-col items-center justify-center
                ${isToday ? 'bg-[#14A1B3] text-white' : ''}
                ${isHoliday ? 'bg-pink-50 dark:bg-pink-900/10' : ''}
              `}
            >
              <span className={`text-sm ${isToday ? 'font-bold' : isHoliday ? 'text-pink-600' : 'text-gray-600 dark:text-gray-400'}`}>
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
