import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Dashboard',
  '/timetable': 'Timetable',
  '/assignments': 'Assignments',
  '/notes': 'Notes AI',
  '/attendance': 'Attendance Tracker',
  '/viva': 'Viva Question Generator',
}

export default function Navbar() {
  const location = useLocation()
  const title = titles[location.pathname] || 'University Kit'

  return (
    <header className="mb-7 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h2>
        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-semibold uppercase tracking-wider">BCA</span>
      </div>
      <p className="text-sm text-gray-400 mt-1">Semester Dashboard</p>
    </header>
  )
}
