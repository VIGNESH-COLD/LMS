import { useState, useEffect, useMemo } from 'react'
import { timetableAPI, structureAPI } from '../../services/api'
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

export default function AdminTimetableTab({ courses, users, showMsg }) {
  const [departments, setDepartments] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  
  const [timetables, setTimetables] = useState([])
  const [loading, setLoading] = useState(false)

  // Editing state for grid
  const [editingCell, setEditingCell] = useState(null) // { day, start }
  const [editForm, setEditForm] = useState({ courseId: '', room: '', building: '' })

  const loadStructure = async () => {
    try {
      const res = await structureAPI.getDepartments()
      setDepartments(res.data)
    } catch (e) { console.error('Error loading depts', e) }
  }

  const loadClasses = async (deptId) => {
    try {
      const res = await structureAPI.getClasses(deptId)
      setClasses(res.data)
    } catch (e) { console.error('Error loading classes', e) }
  }

  const loadSections = async (classId) => {
    try {
      const res = await structureAPI.getSections(classId)
      setSections(res.data)
    } catch (e) { console.error('Error loading sections', e) }
  }
  
  const loadTimetable = async () => {
    setLoading(true)
    try {
      if (selectedSection) {
        const res = await timetableAPI.getBySection(selectedSection)
        setTimetables(res.data)
      } else {
        const res = await timetableAPI.getAll()
        setTimetables(res.data)
      }
    } catch (e) { console.error('Error loading timetable', e) }
    setLoading(false)
  }

  useEffect(() => { loadStructure() }, [])

  useEffect(() => {
    if (selectedDept) loadClasses(selectedDept)
    else { setClasses([]); setSections([]); setSelectedClass(''); setSelectedSection('') }
  }, [selectedDept])

  useEffect(() => {
    if (selectedClass) loadSections(selectedClass)
    else { setSections([]); setSelectedSection('') }
  }, [selectedClass])

  useEffect(() => {
    loadTimetable()
  }, [selectedSection])

  const handleSaveCell = async (e) => {
    e.preventDefault()
    if (!selectedSection) { alert('Select a section first!'); return; }
    
    // Find period end time based on start
    const p = PERIODS.find(per => per.start === editingCell.start)
    if(!p) return;

    try {
      // Create or update timetable slot
      await timetableAPI.create({
        courseId: editForm.courseId,
        dayOfWeek: editingCell.day,
        startTime: editingCell.start,
        endTime: p.end,
        room: editForm.room || 'A208',
        building: editForm.building || 'Main Block',
        sectionId: selectedSection
      })
      showMsg('Timetable slot saved')
      setEditingCell(null)
      loadTimetable()
    } catch (e) {
      alert('Error saving timetable')
    }
  }

  const handleDeleteSlot = async (id) => {
    try {
      await timetableAPI.delete(id)
      showMsg('Slot removed')
      setEditingCell(null)
      loadTimetable()
    } catch (e) { alert('Error deleting') }
  }

  const getSlot = (day, start) => {
    return timetables.find(t => t.dayOfWeek.toUpperCase() === day && t.startTime === start)
  }

  return (
    <div className="animate-fade-in">
      <h2 className="section-title flex items-center gap-2"><Calendar className="w-6 h-6 text-blue-500"/> Class Timetable Management</h2>

      {/* Target Selector */}
      <div className="glass-card p-4 mb-6 sticky top-0 z-20">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label-text">Department</label>
            <select className="input-field" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
             <label className="label-text">Year/Class</label>
            <select className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedDept}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>Year {c.collegeYear} - Sem {c.semester}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="label-text">Section</label>
            <select className="input-field" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}>
              <option value="">Select Section</option>
              {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Timetable Grid View */}
      <div className="glass-card overflow-hidden bg-white dark:bg-[#1a1a1a]">
        
        {/* Header Metadata matching the Image roughly */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-white/10 text-center relative flex flex-col sm:flex-row justify-between gap-2">
           <div className="sm:text-left sm:w-1/3">
              <div className="font-bold text-sm text-heading">Class: {selectedSection ? `Section ${sections.find(s=>String(s.id)===selectedSection)?.name}` : 'Not Selected'}</div>
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

        <div className="overflow-x-auto p-2 sm:p-4">
          <table className="w-full text-center min-w-[700px] table-fixed border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/5 p-2 font-bold w-[10%] align-top text-xs">
                  Day / Period
                </th>
                {PERIODS.map(p => (
                  <th key={p.id} className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/5 p-2 font-bold w-[10%] align-top overflow-hidden">
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
                       // Only render BREAK cell on Monday spanning 5 rows
                       if (day === 'MONDAY') {
                          return (
                             <td key={p.id} rowSpan={5} className="border border-gray-300 dark:border-gray-700 text-center align-middle font-bold text-sub tracking-widest p-1 bg-gray-100 dark:bg-white/5">
                                <div className="-rotate-90 whitespace-nowrap">{p.label}</div>
                             </td>
                          )
                       }
                       return null; // Skip rendering for other days!
                    }

                    const slot = getSlot(day, p.start)
                    const isEditing = editingCell?.day === day && editingCell?.start === p.start

                    return (
                      <td key={p.id} className="border border-gray-300 dark:border-gray-700 p-1 relative h-20 group">
                        
                        {isEditing ? (
                           <div className="absolute inset-x-0 inset-y-0 z-20 bg-white dark:bg-gray-800 p-2 shadow-2xl flex flex-col justify-center items-center border-2 border-primary-500 rounded">
                             <select 
                               className="input-field py-1 px-2 text-[10px] w-[95%] mb-1 h-8" 
                               value={editForm.courseId} 
                               onChange={e => setEditForm({...editForm, courseId: e.target.value})}
                               autoFocus
                             >
                                <option value="">Subject</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                             </select>
                             <div className="flex gap-1 w-full justify-center">
                               {slot && <button onClick={() => handleDeleteSlot(slot.id)} className="text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-1 py-1 rounded font-medium border border-transparent hover:border-red-200">Del</button>}
                               <button onClick={() => setEditingCell(null)} className="text-[10px] hover:bg-gray-100 dark:hover:bg-white/10 px-1 py-1 rounded text-sub border border-transparent">Cancel</button>
                               <button onClick={handleSaveCell} className="text-[10px] bg-primary-500 text-white px-2 py-1 rounded hover:bg-primary-600 font-bold ml-1">Save</button>
                             </div>
                           </div>
                        ) : slot ? (
                           <div className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors p-1" 
                                onClick={() => { setEditForm({ courseId: slot.courseId, room: slot.room, building: slot.building }); setEditingCell({ day, start: p.start }) }}>
                              <span className="font-bold text-heading text-[10px] sm:text-xs leading-tight break-words whitespace-normal text-center">{slot.courseTitle}</span>
                              <span className="text-[9px] text-sub mt-0.5">{slot.room}</span>
                           </div>
                        ) : (
                           <div className="flex items-center justify-center h-full w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                onClick={() => { setEditForm({ courseId: '', room: 'A208', building: 'Main Block' }); setEditingCell({ day, start: p.start }) }}>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-400 text-lg">
                                 +
                              </div>
                           </div>
                        )}
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
