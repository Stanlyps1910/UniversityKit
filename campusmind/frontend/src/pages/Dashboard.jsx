import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { FiCalendar, FiClipboard, FiBookOpen, FiTrendingUp, FiClock, FiMapPin, FiX, FiSave } from 'react-icons/fi'

const API = 'http://localhost:8000'

const quotes = [
  'Success is the sum of small efforts repeated day in and day out.',
  'The expert in anything was once a beginner.',
  'Push yourself, because no one else is going to do it for you.',
  'Your education is a dress rehearsal for a life that is yours to lead.',
  'It always seems impossible until it is done.',
  'BCA is not just a degree \u2014 it is a mindset.',
  'Code today, conquer tomorrow.',
]

export default function Dashboard() {
  const [todayClasses, setTodayClasses] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [subjectsCount, setSubjectsCount] = useState(0)
  const [semester, setSemester] = useState({ semester: 1, start_date: '', end_date: '' })
  const [semesterModal, setSemesterModal] = useState(false)
  const [editSem, setEditSem] = useState({ semester: 1, start_date: '', end_date: '' })
  const [savingSem, setSavingSem] = useState(false)
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, assignmentsRes, semRes, subjectsRes] = await Promise.all([
          axios.get(`${API}/timetable/today`),
          axios.get(`${API}/assignments/pending`),
          axios.get(`${API}/semester/settings`),
          axios.get(`${API}/attendance/subjects`),
        ])
        setTodayClasses(classesRes.data)
        setPendingCount(assignmentsRes.data.length)
        setSemester(semRes.data)
        setSubjectsCount(subjectsRes.data.length)
      } catch {
        setTodayClasses([])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const openSemesterEdit = () => {
    setEditSem({ ...semester })
    setSemesterModal(true)
  }

  const saveSemester = async () => {
    if (!editSem.start_date || !editSem.end_date) return toast.error('Please fill all fields')
    if (editSem.semester < 1) return toast.error('Invalid semester number')
    setSavingSem(true)
    try {
      await axios.put(`${API}/semester/settings`, editSem)
      setSemester({ ...editSem })
      toast.success('Semester updated')
      setSemesterModal(false)
    } catch {
      toast.error('Failed to save')
    }
    setSavingSem(false)
  }

  const statCards = [
    { label: "Today's Classes", value: todayClasses.length, icon: FiCalendar, gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-50' },
    { label: 'Pending Assignments', value: pendingCount, icon: FiClipboard, gradient: 'from-orange-500 to-pink-500', bg: 'bg-orange-50' },
    { label: 'Subjects', value: subjectsCount, icon: FiBookOpen, gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    { label: `Semester ${semester.semester}`, value: `${semester.semester}`, icon: FiTrendingUp, gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', editable: true },
  ]

  return (
    <div>
      <Navbar />
      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={card.editable ? openSemesterEdit : undefined}
            className={`group bg-white rounded-2xl p-5 border border-gray-100 transition-all duration-300 ${
              card.editable ? 'cursor-pointer hover:border-purple-200 hover:shadow-lg relative' : 'cursor-default hover:border-gray-200 hover:shadow-lg'
            }`}
          >
            {card.editable && (
              <span className="absolute top-2 right-2 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Edit</span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`text-lg bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`} />
              </div>
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50">
                <FiCalendar className="text-rose-500" size={14} />
              </div>
              Today's Classes
            </h3>
            {!loading && <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{todayClasses.length} class{todayClasses.length !== 1 ? 'es' : ''}</span>}
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse-soft" />
              ))}
            </div>
          ) : todayClasses.length === 0 ? (
            <div className="text-center py-10">
              <FiCalendar className="text-3xl mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">No classes scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayClasses.map((cls, i) => (
                <div key={cls.id} className="group flex items-center justify-between bg-gray-50/80 hover:bg-rose-50/50 rounded-xl p-3.5 border border-gray-100 hover:border-rose-100 transition-all duration-200 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold uppercase shadow-sm shadow-rose-200">
                      {cls.subject.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cls.subject}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <FiMapPin size={11} />
                        {cls.faculty} &middot; Room {cls.room}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
                    <FiClock size={12} className="text-rose-500" />
                    <span className="text-xs font-semibold text-rose-600 tabular-nums">{cls.start_time.slice(0, 5)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-sm font-semibold text-gray-700 mb-4 relative">
            <span className="inline-block w-1 h-4 bg-rose-500 rounded-full mr-2 align-middle" />
            Motivational Corner
          </h3>
          <div className="flex flex-col items-center justify-center min-h-[160px] relative">
            <div className="text-3xl mb-4 text-rose-200 leading-none">&ldquo;</div>
            <p className="text-base text-gray-600 italic text-center leading-relaxed px-2">&quot;{quote}&quot;</p>
            <div className="mt-4 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-rose-200" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {semesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSemesterModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl border border-gray-100 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-gray-700">Edit Semester</h3>
              <button onClick={() => setSemesterModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Semester</label>
                <input type="number" min="1" max="8" value={editSem.semester} onChange={(e) => setEditSem({ ...editSem, semester: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Start Date</label>
                <input type="date" value={editSem.start_date} onChange={(e) => setEditSem({ ...editSem, start_date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">End Date</label>
                <input type="date" value={editSem.end_date} onChange={(e) => setEditSem({ ...editSem, end_date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setSemesterModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm transition-all duration-200">
                Cancel
              </button>
              <button onClick={saveSemester} disabled={savingSem} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-sm text-white shadow-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
                {savingSem ? 'Saving...' : <><FiSave size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
