import { useState } from 'react'
import { FiSend, FiLoader } from 'react-icons/fi'

export default function ChatBox({ onAsk, loading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    onAsk(input.trim())
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your notes..."
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 shadow-sm transition-all"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 rounded-xl transition-all duration-200 text-white shadow-sm hover:shadow-md active:scale-95"
      >
        {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
      </button>
    </form>
  )
}
