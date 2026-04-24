import React from 'react'
import { Calendar } from 'lucide-react'

const PERIODS = [
  { id: 1, label: '1', time: '8.00 AM TO 8.50 AM', start: '08:00', end: '08:50', isBreak: false },
  { id: 2, label: '2', time: '8.50 AM TO 9.40 AM', start: '08:50', end: '09:40', isBreak: false },
  { id: 'b1', label: 'BREAK', time: '9.40 AM TO 10.10 AM', isBreak: true },
  { id: 3, label: '3', time: '10.10 AM TO 11.00 AM', start: '10:10', end: '11:00', isBreak: false },
  { id: 4, label: '4', time: '11.00 AM TO 11.50 AM', start: '11:00', end: '11:50', isBreak: false },
  { id: 5, label: '5', time: '11.50 AM TO 12.40 PM', start: '11:50', end: '12:40', isBreak: false },
  { id: 'l1', label: 'LUNCH', time: '12.40 PM TO 1.30 PM', isBreak: true },
  { id: 6, label: '6', time: '1.30 PM TO 2.15 PM', start: '13:30', end: '14:15', isBreak: false },
  { id: 7, label: '7', time: '2.15 PM TO 3.00 PM', start: '14:15', end: '15:00', isBreak: false }
]

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

export default function SharedTimetableTab({ timetables, title, subtitle }) {

  const getSlot = (day, start) => {
    return timetables.find(t => t.dayOfWeek.toUpperCase() === day && t.startTime === start)
  }

  return (
    <div className="animate-fade-in">
      <h2 className="section-title flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500"/> {title || 'Class Timetable'}</h2>

      <div className="glass-card overflow-hidden bg-white dark:bg-[#1a1a1a]">
        
        {/* Header Metadata matching the Image */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-white/10 text-center relative flex flex-col sm:flex-row justify-between gap-2">
           <div className="sm:text-left sm:w-1/3">
              <div className="font-bold text-sm text-heading">{subtitle}</div>
           </div>
           <div className="sm:w-1/3 text-center">
              <div className="font-bold text-heading uppercase text-sm sm:text-base">DEPARTMENT TIMETABLE</div>
              <div className="text-xs sm:text-sm text-sub">Even Semester (2025-26)</div>
           </div>
           <div className="text-center sm:text-right text-xs sm:text-sm sm:w-1/3">
              <span className="font-bold text-heading">Venue:</span> A208
              <span className="mx-2 sm:hidden">•</span>
              <br className="hidden sm:block" />
              <span className="font-bold text-heading">w.e.f:</span> 05-01-2026
           </div>
        </div>

        <div className="p-2 sm:p-4 overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs sm:text-sm min-w-[700px]">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/5 p-2 font-bold min-w-[100px] align-top text-xs">
                  Day / Period
                </th>
                {PERIODS.map(p => (
                  <th key={p.id} className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/5 p-2 font-bold w-[120px] align-top">
                     {p.isBreak ? <br/> : <div className="text-base text-heading mb-1">{p.label}</div>}
                     <div className="text-[10px] text-muted whitespace-nowrap">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="border border-gray-300 dark:border-gray-700 p-2 font-bold text-sub bg-gray-50 dark:bg-white/5">
                     {day.charAt(0) + day.slice(1).toLowerCase()}
                  </td>
                  {PERIODS.map(p => {
                    if (p.isBreak) {
                       if (day === 'MONDAY') {
                          return (
                             <td key={p.id} rowSpan={5} className="border border-gray-300 dark:border-gray-700 text-center align-middle font-bold text-sub tracking-widest p-1 bg-gray-100 dark:bg-white/5">
                                <div className="-rotate-90 whitespace-nowrap">{p.label}</div>
                             </td>
                          )
                       }
                       return null;
                    }

                    const slot = getSlot(day, p.start)

                    return (
                      <td key={p.id} className="border border-gray-300 dark:border-gray-700 p-1 relative h-20 group hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                        {slot ? (
                           <div className="flex flex-col items-center justify-center p-1 cursor-default h-full w-full">
                              <span className="font-bold text-heading text-[11px] text-center leading-tight break-words">{slot.courseTitle}</span>
                              <span className="text-[9px] text-sub mt-2">{slot.room}</span>
                           </div>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
