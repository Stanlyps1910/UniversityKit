const KEYS = {
  TIMETABLE: 'uni_assistant_timetable',
  ASSIGNMENTS: 'uni_assistant_assignments',
  SEMESTER: 'uni_assistant_semester',
}

const getFromStorage = (key, defaultValue) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : defaultValue
}

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const storage = {
  // Timetable
  getTimetable: () => getFromStorage(KEYS.TIMETABLE, []),
  saveTimetable: (entries) => saveToStorage(KEYS.TIMETABLE, entries),
  addTimetableEntry: (entry) => {
    const entries = storage.getTimetable()
    const newEntry = { ...entry, id: Date.now() }
    storage.saveTimetable([...entries, newEntry])
    return newEntry
  },
  deleteTimetableEntry: (id) => {
    const entries = storage.getTimetable()
    storage.saveTimetable(entries.filter(e => e.id !== id))
  },

  // Assignments
  getAssignments: () => getFromStorage(KEYS.ASSIGNMENTS, []),
  saveAssignments: (assignments) => saveToStorage(KEYS.ASSIGNMENTS, assignments),
  addAssignment: (assignment) => {
    const assignments = storage.getAssignments()
    const newAssignment = { 
      ...assignment, 
      id: Date.now(), 
      is_completed: false,
      created_at: new Date().toISOString() 
    }
    storage.saveAssignments([...assignments, newAssignment])
    return newAssignment
  },
  updateAssignment: (id, updates) => {
    const assignments = storage.getAssignments()
    storage.saveAssignments(assignments.map(a => a.id === id ? { ...a, ...updates } : a))
  },
  deleteAssignment: (id) => {
    const assignments = storage.getAssignments()
    storage.saveAssignments(assignments.filter(a => a.id !== id))
  },

  // Semester Settings
  getSemester: () => getFromStorage(KEYS.SEMESTER, {
    course: 'BCA',
    semester: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }),
  saveSemester: (settings) => saveToStorage(KEYS.SEMESTER, settings),
}
