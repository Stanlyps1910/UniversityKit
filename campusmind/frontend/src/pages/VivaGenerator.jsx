import { useState, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { FiLoader, FiChevronDown, FiChevronUp, FiUpload, FiMessageSquare, FiFileText } from 'react-icons/fi'

const API = 'http://localhost:8000'

const typeLabels = { viva: 'Viva Questions', mcq: 'MCQs', short_answer: 'Short Answer Questions' }

export default function VivaGenerator() {
  const [topic, setTopic] = useState('')
  const [type, setType] = useState('viva')
  const [fileId, setFileId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})
  const fileInput = useRef(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.pdf')) return toast.error('Only PDF files are supported')

    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axios.post(`${API}/notes/upload`, formData)
      setFileId(res.data.file_id)
      toast.success('PDF uploaded successfully')
    } catch {
      toast.error('Upload failed')
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error('Please enter a topic')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/viva/generate`, { topic, file_id: fileId || '', type })
      setQuestions(res.data.questions)
      setExpanded({})
      if (res.data.questions.length === 0) toast.error('No questions were generated')
    } catch {
      toast.error('Generation failed. Please try again.')
    }
    setLoading(false)
  }

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div>
      <Navbar />
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-lg bg-rose-50">
            <FiMessageSquare className="text-rose-500" size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-700">Question Generator</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Topic</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all" placeholder="e.g. Data Structures, DBMS, Python..." />
          </div>
          <div className="w-[170px]">
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all">
              <option value="viva">Viva Questions</option>
              <option value="mcq">MCQs</option>
              <option value="short_answer">Short Answer</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Reference PDF</label>
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer text-sm ${
              fileId
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}>
              {fileId ? <FiFileText size={14} /> : <FiUpload size={14} />}
              {fileId ? 'PDF loaded' : 'Upload PDF'}
              <input ref={fileInput} type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
            </label>
          </div>
          <button onClick={handleGenerate} disabled={loading || !topic.trim()}
            className="bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 text-white shadow-sm hover:shadow-md active:scale-95">
            {loading ? <FiLoader className="animate-spin" /> : <FiMessageSquare size={15} />}
            Generate
          </button>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">{typeLabels[type] || 'Questions'}</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
          </div>
          {questions.map((q, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-800">{q.question}</p>
                </div>
                <div className={`p-1 rounded-lg transition-all duration-200 ${expanded[idx] ? 'bg-rose-50 text-rose-500' : 'text-gray-300'}`}>
                  {expanded[idx] ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </div>
              </button>
              {expanded[idx] && (
                <div className="border-t border-gray-100 animate-fade-in">
                  <div className="px-4 pb-4 pt-3">
                    <div className="ml-10">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">Answer</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{q.answer}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {questions.length === 0 && !loading && (
        <div className="text-center py-14">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
            <FiMessageSquare className="text-2xl text-rose-300" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">No questions yet</p>
          <p className="text-xs text-gray-400">Enter a topic above to generate questions</p>
        </div>
      )}

      {loading && (
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse-soft">
              <div className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-gray-100" />
                <div className="h-4 bg-gray-100 rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
