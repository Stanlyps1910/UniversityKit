import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FiGrid, FiCalendar, FiClipboard, FiFileText, FiCheckCircle, FiMessageSquare } from 'react-icons/fi'
import axios from 'axios'

const API = 'http://localhost:8000'

const links = [
  { to: '/', label: 'Dashboard', icon: FiGrid },
  { to: '/timetable', label: 'Timetable', icon: FiCalendar },
  { to: '/assignments', label: 'Assignments', icon: FiClipboard },
  { to: '/notes', label: 'Notes AI', icon: FiFileText },
  { to: '/attendance', label: 'Attendance', icon: FiCheckCircle },
  { to: '/viva', label: 'Viva Generator', icon: FiMessageSquare },
]

export default function Sidebar() {
  const [course, setCourse] = useState('BCA')

  useEffect(() => {
    axios.get(`${API}/semester/settings`).then((res) => {
      if (res.data.course) setCourse(res.data.course)
    }).catch(() => {})
  }, [])

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 p-4 flex flex-col z-10">
      <div className="mb-8 px-3 pt-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-rose-200">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">University Kit</h1>
            <p className="text-[10px] text-gray-400 tracking-wide uppercase">Smart Assistant</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative ${
                isActive
                  ? 'text-rose-700 bg-rose-50 font-medium'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-rose-500 rounded-full" />}
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-rose-100 text-rose-600' : 'bg-transparent group-hover:bg-gray-100'
                }`}>
                  <link.icon className="text-base" />
                </div>
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="text-[10px] text-gray-300 px-3 pt-4 border-t border-gray-50 tracking-wide">
        v1.0 &middot; {course} Edition
      </div>
    </aside>
  )
}
