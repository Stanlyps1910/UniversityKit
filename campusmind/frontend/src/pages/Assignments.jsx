import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { FiTrash2, FiCheck, FiPlus, FiCalendar } from 'react-icons/fi'
import { storage } from '../utils/storage'

const priorityConfig = {
  high: { label: 'High', ring: 'ring-red-200', badge: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500' },
  medium: { label: 'Medium', ring: 'ring-yellow-200', badge: 'text-yellow-700 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
  low: { label: 'Low', ring: 'ring-green-200', badge: 'text-green-700 bg-green-50 border-green-200', dot: 'bg-green-500' },
}

export default function Assignments() {
  const [pending, setPending] = useState([])
  const [completed, setCompleted] = useState([])
  const [form, setForm] = useState({ title: '', subject: '', deadline: '', priority: 'medium' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = () => {
    try {
      const all = storage.getAssignments()
      setPending(all.filter(a => !a.is_completed).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)))
      setCompleted(all.filter(a => a.is_completed).sort((a, b) => new Date(b.deadline) - new Date(a.deadline)))
    } catch {
      setPending([])
      setCompleted([])
    }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title || !form.subject || !form.deadline) return toast.error('Please fill in all fields')
    try {
      storage.addAssignment(form)
      toast.success('Assignment added')
      fetchAll()
      setForm({ title: '', subject: '', deadline: '', priority: 'medium' })
    } catch { toast.error('Failed to add assignment') }
  }

  const handleComplete = (id) => {
    try {
      storage.updateAssignment(id, { is_completed: true })
      toast.success('Marked as completed')
      fetchAll()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = (id) => {
    try {
      storage.deleteAssignment(id)
      toast.success('Assignment deleted')
      fetchAll()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <Navbar />
      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 mb-7 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-rose-50">
            <FiPlus className="text-rose-500" size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-700">New Assignment</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" placeholder="Assignment title" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Subject</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" placeholder="Subject" />
          </div>
          <div className="w-[160px]">
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" />
          </div>
          <div className="w-[120px]">
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button type="submit" className="bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 px-5 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 text-white shadow-sm hover:shadow-md active:scale-95">
            <FiPlus size={15} /> Add
          </button>
        </div>
      </form>

      <div className="mb-9">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Pending
          </h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{pending.length} item{pending.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-2.5">
          {pending.length === 0 && (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
              <FiCheck className="text-2xl mx-auto mb-1.5 text-gray-300" />
              <p className="text-sm text-gray-400">No pending assignments</p>
            </div>
          )}
          {pending.map((a, i) => {
            const pc = priorityConfig[a.priority]
            return (
              <div key={a.id} className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 animate-slide-up flex items-center justify-between" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`w-1 h-10 rounded-full ${pc.dot} shrink-0`} />
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${pc.badge} shrink-0`}>
                    {pc.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      {a.subject}
                      <span className="text-gray-200">|</span>
                      <FiCalendar size={11} className="text-gray-300" />
                      Due {a.deadline}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 ml-3">
                  <button onClick={() => handleComplete(a.id)} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 transition-all active:scale-95">
                    <FiCheck size={14} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:scale-105 transition-all active:scale-95">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Completed
          </h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{completed.length} item{completed.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-2">
          {completed.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-6">No completed assignments yet</p>
          ) : (
            completed.map((a) => (
              <div key={a.id} className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 group hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <FiCheck className="text-emerald-500" size={13} />
                </div>
                <p className="text-sm text-slate-500 line-through decoration-slate-300">{a.title}</p>
                <span className="text-xs text-slate-300">&middot;</span>
                <p className="text-xs text-slate-400">{a.subject}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
