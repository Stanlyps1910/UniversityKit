import { storage } from './storage'

const riskConfig = {
  safe: {
    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
    label: 'SAFE', gradient: 'from-emerald-500 to-green-500',
  },
  warning: {
    color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
    label: 'WARNING', gradient: 'from-amber-500 to-yellow-500',
  },
  danger: {
    color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200',
    label: 'DANGER', gradient: 'from-red-500 to-rose-500',
  },
}

export const calculateRemainingClasses = (subject) => {
  const settings = storage.getSemester()
  const timetable = storage.getTimetable()
  
  if (!settings || !settings.end_date) return 0
  
  const subjectEntries = timetable.filter(e => e.subject === subject)
  if (subjectEntries.length === 0) return 0
  
  const daysOfWeek = new Set(subjectEntries.map(e => e.day))
  const endDate = new Date(settings.end_date)
  const today = new Date()
  
  let remaining = 0
  let current = new Date(today)
  current.setDate(current.getDate() + 1) // Start from tomorrow
  
  const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  while (current <= endDate) {
    const dayName = dayMap[current.getDay()]
    if (daysOfWeek.has(dayName)) {
      remaining++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return remaining
}

export const calculateAttendanceStats = (data) => {
  const { total_classes, attended, remaining_classes, target_percentage } = data
  
  if (total_classes <= 0) return { error: "Total classes must be greater than 0" }
  if (attended > total_classes) return { error: "Attended cannot exceed total classes" }
  if (attended < 0) return { error: "Attended classes cannot be negative" }

  const current_pct = Math.round((attended / total_classes) * 10000) / 100
  const future_total = total_classes + remaining_classes

  let needed_to_reach_target = 0
  if (future_total > 0) {
    for (let i = 0; i <= remaining_classes; i++) {
      const future_pct = ((attended + i) / future_total) * 100
      if (future_pct >= target_percentage) {
        needed_to_reach_target = i
        break
      }
      if (i === remaining_classes) needed_to_reach_target = remaining_classes + 1
    }
  }

  let can_skip = 0
  if (future_total > 0) {
    for (let i = 0; i <= remaining_classes; i++) {
      const attended_if_skip_i = attended + (remaining_classes - i)
      const future_pct = (attended_if_skip_i / future_total) * 100
      if (future_pct >= target_percentage) {
        can_skip = i
      } else {
        break
      }
    }
  }

  let risk = "danger"
  if (current_pct >= target_percentage) risk = "safe"
  else if (current_pct >= target_percentage - 10) risk = "warning"

  return {
    current_percentage: current_pct,
    target_percentage: target_percentage,
    classes_needed_to_reach_target: Math.max(0, needed_to_reach_target),
    classes_you_can_skip: can_skip,
    risk_level: risk,
  }
}
