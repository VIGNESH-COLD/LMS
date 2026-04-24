import { useState, useEffect } from 'react'
import { structureAPI } from '../../services/api'

export default function AdminDepartmentTab({ showMsg }) {
  const [departments, setDepartments] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])

  const [selectedDept, setSelectedDept] = useState('')
  const [selectedClass, setSelectedClass] = useState('')

  const [newDeptName, setNewDeptName] = useState('')
  
  const [newClass, setNewClass] = useState({ collegeYear: '', semester: '', batchYear: '' })
  const [newSectionName, setNewSectionName] = useState('')

  const loadDepartments = async () => {
    try {
      const res = await structureAPI.getDepartments()
      setDepartments(res.data)
    } catch (e) { console.error(e) }
  }

  const loadClasses = async (deptId) => {
    try {
      const res = await structureAPI.getClasses(deptId)
      setClasses(res.data)
    } catch (e) { console.error(e) }
  }

  const loadSections = async (classId) => {
    try {
      const res = await structureAPI.getSections(classId)
      setSections(res.data)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { loadDepartments() }, [])

  useEffect(() => {
    if (selectedDept) loadClasses(selectedDept)
    else { setClasses([]); setSections([]); setSelectedClass('') }
  }, [selectedDept])

  useEffect(() => {
    if (selectedClass) loadSections(selectedClass)
    else setSections([])
  }, [selectedClass])

  const handleAddDept = async (e) => {
    e.preventDefault()
    try {
      await structureAPI.createDepartment({ name: newDeptName })
      showMsg('Department created')
      setNewDeptName('')
      loadDepartments()
    } catch (e) { alert('Failed to create department: Maybe it already exists?') }
  }

  const handleDeleteDept = async (id) => {
    if(!confirm('Delete this department?')) return
    try {
      await structureAPI.deleteDepartment(id)
      showMsg('Department deleted')
      if (selectedDept === String(id)) setSelectedDept('')
      loadDepartments()
    } catch (e) { alert('Delete failed. Ensure classes are removed first.') }
  }

  const handleAddClass = async (e) => {
    e.preventDefault()
    if(!selectedDept) { alert('Select department first'); return }
    try {
      await structureAPI.createClass(selectedDept, {
        collegeYear: Number(newClass.collegeYear),
        semester: Number(newClass.semester),
        batchYear: Number(newClass.batchYear)
      })
      showMsg('Class created')
      setNewClass({ collegeYear: '', semester: '', batchYear: '' })
      loadClasses(selectedDept)
    } catch (e) { alert('Failed to create class') }
  }

  const handleDeleteClass = async (id) => {
    if(!confirm('Delete this class?')) return
    try {
      await structureAPI.deleteClass(id)
      showMsg('Class deleted')
      if (selectedClass === String(id)) setSelectedClass('')
      loadClasses(selectedDept)
    } catch (e) { alert('Delete failed. Remove sections first.') }
  }

  const handleAddSection = async (e) => {
    e.preventDefault()
    if(!selectedClass) { alert('Select class first'); return }
    try {
      await structureAPI.createSection(selectedClass, { name: newSectionName })
      showMsg('Section created')
      setNewSectionName('')
      loadSections(selectedClass)
    } catch (e) { alert('Failed to create section') }
  }

  const handleDeleteSection = async (id) => {
    if(!confirm('Delete this section?')) return
    try {
      await structureAPI.deleteSection(id)
      showMsg('Section deleted')
      loadSections(selectedClass)
    } catch (e) { alert('Delete failed.') }
  }

  return (
    <div className="animate-fade-in space-y-8">
      <h2 className="section-title">🏛️ Academic Structure Management</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 1. DEPARTMENTS */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-heading mb-4 border-b border-gray-100 dark:border-white/10 pb-2">1. Departments</h3>
          
          <form onSubmit={handleAddDept} className="flex gap-2 mb-4">
            <input className="input-field flex-1 text-sm py-2" placeholder="Ex: Computer Science" required value={newDeptName} onChange={e=>setNewDeptName(e.target.value)} />
            <button className="btn-primary py-2 px-4 whitespace-nowrap">Add</button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-2">
             {departments.map(d => (
                <div key={d.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedDept === String(d.id) ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500' : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200'}`} onClick={() => setSelectedDept(String(d.id))}>
                   <span className="font-semibold text-heading text-sm">{d.name}</span>
                   <button className="text-red-400 hover:text-red-600 p-1" onClick={(e) => { e.stopPropagation(); handleDeleteDept(d.id); }}>🗑️</button>
                </div>
             ))}
             {departments.length === 0 && <p className="text-muted text-sm text-center py-4">No departments found.</p>}
          </div>
        </div>

        {/* 2. CLASSES */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-heading mb-4 border-b border-gray-100 dark:border-white/10 pb-2">2. Classes <span className="text-sm font-normal text-sub">(Select Dept First)</span></h3>
          
          <form onSubmit={handleAddClass} className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
               <input type="number" className="input-field flex-1 text-sm py-2" placeholder="Year (e.g. 2)" min="1" max="5" required value={newClass.collegeYear} onChange={e=>setNewClass({...newClass, collegeYear: e.target.value})} disabled={!selectedDept} />
               <input type="number" className="input-field flex-1 text-sm py-2" placeholder="Sem (e.g. 4)" min="1" max="10" required value={newClass.semester} onChange={e=>setNewClass({...newClass, semester: e.target.value})} disabled={!selectedDept} />
            </div>
            <div className="flex gap-2">
               <input type="number" className="input-field flex-1 text-sm py-2" placeholder="Batch Year (e.g. 2025)" required value={newClass.batchYear} onChange={e=>setNewClass({...newClass, batchYear: e.target.value})} disabled={!selectedDept} />
               <button className="btn-primary py-2 px-4 whitespace-nowrap" disabled={!selectedDept}>Add</button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-2">
             {!selectedDept ? <p className="text-muted text-sm text-center py-4">Select a department.</p> : classes.map(c => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedClass === String(c.id) ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500' : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200'}`} onClick={() => setSelectedClass(String(c.id))}>
                   <div className="flex flex-col">
                      <span className="font-semibold text-heading text-sm">Year {c.collegeYear} - Sem {c.semester}</span>
                      <span className="text-xs text-sub">Batch: {c.batchYear}</span>
                   </div>
                   <button className="text-red-400 hover:text-red-600 p-1" onClick={(e) => { e.stopPropagation(); handleDeleteClass(c.id); }}>🗑️</button>
                </div>
             ))}
             {selectedDept && classes.length === 0 && <p className="text-muted text-sm text-center py-4">No classes in this department.</p>}
          </div>
        </div>

        {/* 3. SECTIONS */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-heading mb-4 border-b border-gray-100 dark:border-white/10 pb-2">3. Sections <span className="text-sm font-normal text-sub">(Select Class First)</span></h3>
          
          <form onSubmit={handleAddSection} className="flex gap-2 mb-4">
            <input className="input-field flex-1 text-sm py-2" placeholder="Section (e.g. A, B, G)" required value={newSectionName} onChange={e=>setNewSectionName(e.target.value)} disabled={!selectedClass} />
            <button className="btn-primary py-2 px-4 whitespace-nowrap" disabled={!selectedClass}>Add</button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-2">
             {!selectedClass ? <p className="text-muted text-sm text-center py-4">Select a class.</p> : sections.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-transparent bg-gray-50 dark:bg-white/5">
                   <span className="font-semibold text-heading text-sm">Section {s.name}</span>
                   <button className="text-red-400 hover:text-red-600 p-1" onClick={() => handleDeleteSection(s.id)}>🗑️</button>
                </div>
             ))}
             {selectedClass && sections.length === 0 && <p className="text-muted text-sm text-center py-4">No sections in this class.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
