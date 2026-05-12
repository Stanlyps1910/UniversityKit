import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { FiTrash2, FiPlus, FiClock, FiMapPin, FiUpload, FiFileText, FiLoader, FiClipboard } from 'react-icons/fi'

const API = 'http://localhost:8000'
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_COLORS = {
  Monday: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  Tuesday: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  Wednesday: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  Thursday: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  Friday: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  Saturday: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
}

const UPLOAD_MODES = { pdf: 'pdf', text: 'text' }

export default function Timetable() {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState({ subject: '', day: 'Monday', start_time: '', end_time: '', faculty: '', room: '' })
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadMode, setUploadMode] = useState(UPLOAD_MODES.pdf)
  const [pastedText, setPastedText] = useState('')
  const fileInput = useRef(null)

  useEffect(() => { fetchWeek() }, [])

  const fetchWeek = async () => {
    try {
      const res = await axios.get(`${API}/timetable/week`)
      setEntries(res.data)
    } catch { setEntries([]) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.subject || !form.start_time || !form.end_time || !form.faculty || !form.room) {
      return toast.error('Please fill in all fields')
    }
    try {
      await axios.post(`${API}/timetable/add`, form)
      toast.success('Class added successfully')
      fetchWeek()
      setForm({ subject: '', day: 'Monday', start_time: '', end_time: '', faculty: '', room: '' })
    } catch { toast.error('Failed to add class') }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/timetable/${id}`)
      toast.success('Class removed')
      fetchWeek()
    } catch { toast.error('Failed to delete') }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.pdf')) return toast.error('Only PDF files are supported')

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axios.post(`${API}/timetable/upload`, formData)
      if (res.data.error) { toast.error(res.data.error) }
      else {
        toast.success(`Timetable updated with ${res.data.count} entries`)
        fetchWeek()
        setShowUpload(false)
      }
    } catch {
      toast.error('Failed to upload timetable. Make sure the backend is running.')
    }
    setUploading(false)
    if (fileInput.current) fileInput.current.value = ''
  }

  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) return toast.error('Paste your timetable text first')
    setUploading(true)
    try {
      const res = await axios.post(`${API}/timetable/parse-text`, { text: pastedText })
      if (res.data.error) { toast.error(res.data.error) }
      else {
        toast.success(`Timetable updated with ${res.data.count} entries`)
        fetchWeek()
        setPastedText('')
        setShowUpload(false)
      }
    } catch {
      toast.error('Failed to parse timetable text')
    }
    setUploading(false)
  }

  const getDayEntries = (day) => entries.filter((e) => e.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <div>
      <Navbar />

      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setShowUpload(false)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            !showUpload ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <FiPlus size={14} className="inline mr-1.5" />Manual Add
        </button>
        <button
          onClick={() => { setShowUpload(true); setUploadMode(UPLOAD_MODES.pdf) }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            showUpload && uploadMode === UPLOAD_MODES.pdf ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <FiUpload size={14} className="inline mr-1.5" />Upload PDF
        </button>
        <button
          onClick={() => { setShowUpload(true); setUploadMode(UPLOAD_MODES.text) }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            showUpload && uploadMode === UPLOAD_MODES.text ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <FiClipboard size={14} className="inline mr-1.5" />Paste Text
        </button>
      </div>

      {showUpload && uploadMode === UPLOAD_MODES.pdf && (
        <div className="bg-white rounded-2xl p-6 mb-7 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-50">
              <FiUpload className="text-rose-500" size={14} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Upload Timetable PDF</span>
          </div>
          <div
            onClick={() => !uploading && fileInput.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-rose-300 rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 hover:bg-rose-50/30 group"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {uploading ? <FiLoader className="animate-spin text-2xl text-rose-400" /> : <FiFileText className="text-2xl text-rose-400" />}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {uploading ? 'Parsing timetable...' : 'Upload your timetable PDF'}
            </p>
            <p className="text-xs text-gray-400">
              {uploading ? 'This may take a moment' : 'The system will automatically extract and populate your schedule'}
            </p>
            <input ref={fileInput} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </div>
          {entries.length > 0 && (
            <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
              <strong>Note:</strong> Uploading a new timetable will replace all existing entries.
            </p>
          )}
        </div>
      )}

      {showUpload && uploadMode === UPLOAD_MODES.text && (
        <div className="bg-white rounded-2xl p-6 mb-7 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-50">
              <FiClipboard className="text-rose-500" size={14} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Paste Timetable Text</span>
          </div>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`Paste your timetable here. Example:\n\nMonday\n09:00 - 10:00 | Data Structures | Dr. Sharma | Room 201\n10:00 - 11:00 | DBMS | Prof. Verma | Room 201\n\nTuesday\n09:00 - 10:00 | Operating Systems | Prof. Singh | Room 203`}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all min-h-[220px] resize-y font-mono"
            disabled={uploading}
          />
          <div className="flex items-center justify-between mt-4">
            {entries.length > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                <strong>Note:</strong> This will replace all existing entries.
              </p>
            )}
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setPastedText('')} disabled={uploading}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm transition-all duration-200 disabled:opacity-40">
                Clear
              </button>
              <button onClick={handlePasteSubmit} disabled={uploading || !pastedText.trim()}
                className="bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 text-white shadow-sm hover:shadow-md active:scale-95">
                {uploading ? <FiLoader className="animate-spin" /> : <FiClipboard size={15} />}
                Parse & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {!showUpload && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 mb-7 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-rose-50">
              <FiPlus className="text-rose-500" size={14} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Add New Class</span>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[130px]">
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Subject</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" placeholder="e.g. Data Structures" />
            </div>
            <div className="w-[140px]">
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Day</label>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="w-[120px]">
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Start</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" />
            </div>
            <div className="w-[120px]">
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">End</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" />
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Faculty</label>
              <input type="text" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" placeholder="Dr. Name" />
            </div>
            <div className="w-[90px]">
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Room</label>
              <input type="text" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" placeholder="101" />
            </div>
            <button type="submit" className="bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 px-5 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 text-white shadow-sm hover:shadow-md active:scale-95">
              <FiPlus size={15} /> Add
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const dayEntries = getDayEntries(day)
          const colors = DAY_COLORS[day]
          return (
            <div key={day} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className={`px-4 py-3 ${colors.bg} border-b ${colors.border}`}>
                <h3 className={`text-sm font-bold ${colors.text}`}>{day}</h3>
              </div>
              <div className="p-3.5 min-h-[100px]">
                {dayEntries.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center py-6">No classes scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <div key={entry.id} className="group bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{entry.subject}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{entry.faculty}</p>
                          </div>
                          <button onClick={() => handleDelete(entry.id)}
                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 -mr-1 -mt-1">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                        <div className="flex gap-3 mt-2 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1"><FiClock size={11} className="text-rose-400" />{entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}</span>
                          <span className="flex items-center gap-1"><FiMapPin size={11} className="text-gray-400" />Room {entry.room}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
