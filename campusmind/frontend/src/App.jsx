import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Timetable from './pages/Timetable'
import Assignments from './pages/Assignments'
import NotesAI from './pages/NotesAI'
import Attendance from './pages/Attendance'
import VivaGenerator from './pages/VivaGenerator'

function PageWrapper({ children }) {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return <div key={location.pathname} className="animate-fade-in">{children}</div>
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#fcfcfd] bg-gradient-to-br from-white via-[#fdf2f2]/30 to-[#fdf2f8]/30">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <Routes>
          <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/timetable" element={<PageWrapper><Timetable /></PageWrapper>} />
          <Route path="/assignments" element={<PageWrapper><Assignments /></PageWrapper>} />
          <Route path="/notes" element={<PageWrapper><NotesAI /></PageWrapper>} />
          <Route path="/attendance" element={<PageWrapper><Attendance /></PageWrapper>} />
          <Route path="/viva" element={<PageWrapper><VivaGenerator /></PageWrapper>} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
        }}
      />
    </div>
  )
}
