import { useState, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import ChatBox from '../components/ChatBox'
import { FiUpload, FiFileText, FiLoader, FiBookOpen, FiCheck } from 'react-icons/fi'

const API = 'http://localhost:8000'

export default function NotesAI() {
  const [fileId, setFileId] = useState(null)
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [asking, setAsking] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [answer, setAnswer] = useState('')
  const [summary, setSummary] = useState('')
  const fileInput = useRef(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.pdf')) return toast.error('Only PDF files are supported')

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axios.post(`${API}/notes/upload`, formData)
      setFileId(res.data.file_id)
      setFileName(file.name)
      toast.success('PDF uploaded and processed')
      setAnswer('')
      setSummary('')
    } catch {
      toast.error('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  const handleAsk = async (question) => {
    if (!fileId) return toast.error('Upload a PDF first')
    setAsking(true)
    setSummary('')
    try {
      const res = await axios.post(`${API}/notes/ask`, { question, file_id: fileId })
      setAnswer(res.data.answer)
    } catch {
      toast.error('Failed to get answer')
    }
    setAsking(false)
  }

  const handleSummarize = async () => {
    if (!fileId) return toast.error('Upload a PDF first')
    setSummarizing(true)
    setAnswer('')
    try {
      const res = await axios.post(`${API}/notes/summarize`, { file_id: fileId })
      setSummary(res.data.summary)
      toast.success('Summary generated')
    } catch {
      toast.error('Summarization failed')
    }
    setSummarizing(false)
  }

  return (
    <div>
      <Navbar />

      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
        {!fileId ? (
          <div
            onClick={() => fileInput.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-rose-300 rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 hover:bg-rose-50/30 group"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FiUpload className="text-2xl text-rose-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">{uploading ? 'Uploading...' : 'Upload a PDF file'}</p>
            <p className="text-xs text-gray-400">Drop your notes or lecture slides here</p>
            <input ref={fileInput} type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
            {uploading && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <FiLoader className="animate-spin text-rose-500" />
                <span className="text-sm text-rose-600">Processing...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm shadow-emerald-200">
                  <FiCheck className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 truncate max-w-[300px]">{fileName}</p>
                  <p className="text-xs text-emerald-600">PDF loaded and ready</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSummarize} disabled={summarizing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm text-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-95">
                  {summarizing ? <FiLoader className="animate-spin" /> : <FiBookOpen size={14} />}
                  Summarize
                </button>
                <button onClick={() => { setFileId(null); setFileName(''); setAnswer(''); setSummary('') }}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm transition-all duration-200">
                  Change
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 mb-3.5">Ask about your notes</h3>
              <ChatBox onAsk={handleAsk} loading={asking} />
            </div>
          </div>
        )}
      </div>

      {summary && (
        <div className="bg-white rounded-2xl p-6 mb-5 border border-gray-100 shadow-sm animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-purple-50">
              <FiBookOpen className="text-purple-600" size={14} />
            </div>
            <h3 className="text-sm font-semibold text-purple-700">Summary</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {answer && (
        <div className="bg-white rounded-2xl p-6 mb-5 border border-gray-100 shadow-sm animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-rose-50">
              <FiFileText className="text-rose-500" size={14} />
            </div>
            <h3 className="text-sm font-semibold text-rose-700">Answer</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      {!fileId && !uploading && (
        <div className="text-center py-10">
          <FiFileText className="text-4xl mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Upload a PDF to unlock Q&A and summarization</p>
        </div>
      )}
    </div>
  )
}
