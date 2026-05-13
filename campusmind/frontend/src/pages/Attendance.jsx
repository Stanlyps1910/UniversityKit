import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiTarget, FiSkipForward, FiPercent } from 'react-icons/fi'
import { storage } from '../utils/storage'
import { calculateRemainingClasses, calculateAttendanceStats } from '../utils/attendance'

const riskConfig = {
  safe: {
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
    icon: FiCheckCircle, label: 'SAFE', gradient: 'from-emerald-500 to-green-500',
  },
  warning: {
    color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
    icon: FiInfo, label: 'WARNING', gradient: 'from-amber-500 to-yellow-500',
  },
  danger: {
    color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200',
    icon: FiAlertCircle, label: 'DANGER', gradient: 'from-red-500 to-rose-500',
  },
}

export default function Attendance() {
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({ subject: '', total_classes: '', attended: '', remaining_classes: '', target_percentage: 75 })
  const [result, setResult] = useState(null)

  useEffect(() => {
    const timetable = storage.getTimetable()
    const subs = [...new Set(timetable.map(e => e.subject))].sort()
    setSubjects(subs)
  }, [])

  const handleSubjectChange = (subject) => {
    const remaining = calculateRemainingClasses(subject)
    setForm((prev) => ({ ...prev, subject, remaining_classes: remaining }))
  }

  const handleCalculate = (e) => {
    e.preventDefault()
    if (!form.total_classes || form.attended === '' || !form.remaining_classes) return toast.error('Please fill in all fields')
    
    const stats = calculateAttendanceStats({
      total_classes: Number(form.total_classes),
      attended: Number(form.attended),
      remaining_classes: Number(form.remaining_classes),
      target_percentage: Number(form.target_percentage),
    })

    if (stats.error) {
      toast.error(stats.error)
    } else {
      setResult(stats)
    }
  }

  return (
    <div>
      <Navbar />
      <form onSubmit={handleCalculate} className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-lg bg-rose-50">
            <FiPercent className="text-rose-500" size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-700">Attendance Calculator</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Subject</label>
            <select value={form.subject} onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all">
              <option value="">Select a subject</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Target Percentage</label>
            <input type="number" min="0" max="100" value={form.target_percentage} onChange={(e) => setForm({ ...form, target_percentage: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Total Classes Held</label>
            <input type="number" min="0" value={form.total_classes} onChange={(e) => setForm({ ...form, total_classes: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" placeholder="e.g. 40" />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Classes Attended</label>
            <input type="number" min="0" value={form.attended} onChange={(e) => setForm({ ...form, attended: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" placeholder="e.g. 30" />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Remaining Classes</label>
            <div className="relative">
              <input type="number" min="0" value={form.remaining_classes} onChange={(e) => setForm({ ...form, remaining_classes: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all pr-8" placeholder="Auto-calculated" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-rose-400 font-medium pointer-events-none">auto</span>
            </div>
            {form.subject && (
              <p className="text-[10px] text-gray-400 mt-1">
                Based on timetable & semester end date
              </p>
            )}
          </div>
        </div>
        <button type="submit" className="bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 px-6 py-2.5 rounded-xl text-sm transition-all duration-200 text-white shadow-sm hover:shadow-md active:scale-95">
          Calculate Attendance
        </button>
      </form>

      {result && result.error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-in">
          <p className="text-sm text-red-700 text-center">{result.error}</p>
        </div>
      )}

      {result && !result.error && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
          <div className={`px-6 py-4 bg-gradient-to-r ${riskConfig[result.risk_level].bg} border-b ${riskConfig[result.risk_level].border}`}>
            <h3 className="text-sm font-semibold text-gray-700">
              Attendance Report {form.subject && <span className="text-gray-400 font-normal">for {form.subject}</span>}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 text-center">
                <p className="text-4xl font-bold text-rose-700 tabular-nums">{result.current_percentage}%</p>
                <p className="text-xs text-rose-400 mt-1.5 font-medium">Current Attendance</p>
              </div>
              <div className={`rounded-2xl p-5 text-center border ${riskConfig[result.risk_level].border} ${riskConfig[result.risk_level].bg}`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  {(() => { const Icon = riskConfig[result.risk_level].icon; return <Icon className={riskConfig[result.risk_level].color} size={20} /> })()}
                  <p className={`text-xl font-bold ${riskConfig[result.risk_level].color}`}>
                    {riskConfig[result.risk_level].label}
                  </p>
                </div>
                <p className="text-xs text-gray-500">Risk Level</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <FiTarget size={14} className="text-rose-400" />
                  Classes to reach {result.target_percentage}% target
                </span>
                <span className="text-sm font-bold text-rose-600 tabular-nums">{result.classes_needed_to_reach_target}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <FiSkipForward size={14} className="text-emerald-400" />
                  Classes you can still skip
                </span>
                <span className="text-sm font-bold text-emerald-600 tabular-nums">{result.classes_you_can_skip}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
