import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { FiTrash2, FiPlus, FiClock, FiMapPin, FiClipboard, FiFileText, FiCopy, FiZap, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { storage } from '../utils/storage'
import { parseTimetableText } from '../utils/parsers'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_COLORS = {
  Monday: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  Tuesday: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  Wednesday: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  Thursday: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  Friday: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  Saturday: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
}

const UPLOAD_MODES = { manual: 'manual', text: 'text' }

const AI_PROMPT = `Convert my university timetable into this exact text format. Each day should be on its own line as a header, followed by classes in this format:

HH:MM - HH:MM | Subject Name | Faculty Name | Room Number

Rules:
- Use 24-hour time format (e.g., 09:00, 14:30)
- Separate fields with " | " (pipe with spaces)
- Put each day header on its own line (Monday, Tuesday, etc.)
- Skip Sunday
- If faculty or room is unknown, write "TBA"

Example output:
Monday
09:00 - 10:00 | Data Structures | Dr. Sharma | Room 201
10:00 - 11:00 | DBMS | Prof. Verma | Room 201

Tuesday
09:00 - 10:00 | Python Programming | Prof. Singh | Room 102

Now convert my timetable (attached) into this format. Output ONLY the formatted text, nothing else.`

export default function Timetable() {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState({ subject: '', day: 'Monday', start_time: '', end_time: '', faculty: '', room: '' })
  const [mode, setMode] = useState(UPLOAD_MODES.manual)
  const [pastedText, setPastedText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => { fetchWeek() }, [])

  const fetchWeek = () => {
    try {
      const data = storage.getTimetable()
      setEntries(data)
    } catch { setEntries([]) }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.subject || !form.start_time || !form.end_time || !form.faculty || !form.room) {
      return toast.error('Please fill in all fields')
    }
    try {
      storage.addTimetableEntry(form)
      toast.success('Class added locally')
      fetchWeek()
      setForm({ subject: '', day: 'Monday', start_time: '', end_time: '', faculty: '', room: '' })
    } catch { toast.error('Failed to add class') }
  }

  const handleDelete = (id) => {
    try {
      storage.deleteTimetableEntry(id)
      toast.success('Class removed')
      fetchWeek()
    } catch { toast.error('Failed to delete') }
  }

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return toast.error('Paste your timetable text first')
    setParsing(true)
    setTimeout(() => {
      try {
        const newEntries = parseTimetableText(pastedText)
        if (newEntries.length === 0) {
          toast.error('Could not find any classes in the text. Check the format!')
        } else {
          storage.saveTimetable(newEntries)
          toast.success(`Imported ${newEntries.length} classes!`)
          fetchWeek()
          setPastedText('')
          setMode(UPLOAD_MODES.manual)
        }
      } catch (err) {
        toast.error('Parsing failed')
      }
      setParsing(false)
    }, 500)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT).then(() => {
      toast.success('Prompt copied! Paste it in ChatGPT or Gemini with your timetable.')
    }).catch(() => {
      toast.error('Failed to copy. Please select and copy manually.')
    })
  }

  const getDayEntries = (day) => entries.filter((e) => e.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <div>
      <Navbar />

      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setMode(UPLOAD_MODES.manual)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            mode === UPLOAD_MODES.manual ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <FiPlus size={14} className="inline mr-1.5" />Manual Add
        </button>
        <button
          onClick={() => setMode(UPLOAD_MODES.text)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            mode === UPLOAD_MODES.text ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <FiClipboard size={14} className="inline mr-1.5" />Paste Text
        </button>
      </div>

      {mode === UPLOAD_MODES.text && (
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
            disabled={parsing}
          />
          <div className="flex items-center justify-between mt-4">
            {entries.length > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                <strong>Note:</strong> This will replace all existing entries.
              </p>
            )}
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setPastedText('')} disabled={parsing}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm transition-all duration-200 disabled:opacity-40">
                Clear
              </button>
              <button onClick={handlePasteSubmit} disabled={parsing || !pastedText.trim()}
                className="bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 text-white shadow-sm hover:shadow-md active:scale-95">
                {parsing ? <FiPlus className="animate-spin" /> : <FiClipboard size={15} />}
                Parse & Update
              </button>
            </div>
          </div>

          {/* AI Prompt Helper */}
          <div className="mt-5 border border-dashed border-purple-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-50/50 hover:bg-purple-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <FiZap className="text-purple-500" size={14} />
                <span className="text-xs font-semibold text-purple-700">Don't have the right format? Use AI to convert your timetable</span>
              </div>
              <div className="text-purple-400">
                {showPrompt ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </div>
            </button>
            {showPrompt && (
              <div className="px-4 pb-4 pt-3 bg-purple-50/30 animate-fade-in">
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Copy the prompt below and paste it in <strong>ChatGPT</strong>, <strong>Gemini</strong>, or any AI chatbot. Attach your timetable image or PDF along with it. Then paste the AI's output here.
                </p>
                <div className="relative">
                  <pre className="bg-white border border-purple-100 rounded-lg p-3.5 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-mono select-all">{AI_PROMPT}</pre>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-purple-50 text-purple-400 hover:bg-purple-100 hover:text-purple-600 transition-all duration-200 active:scale-95"
                    title="Copy prompt"
                  >
                    <FiCopy size={13} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2.5 flex items-center gap-1">
                  <FiZap size={10} className="text-purple-400" />
                  Works with ChatGPT, Gemini, Claude, Copilot, and any other AI assistant
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === UPLOAD_MODES.manual && (
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
