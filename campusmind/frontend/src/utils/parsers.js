const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const cleanVal = (val) => {
  val = (val || "").trim().replace(/^\|+|\|+$/g, "").trim()
  return !val || ["none", "n/a", "tbd", ""].includes(val.toLowerCase()) ? "TBA" : val
}

export const parseTimetableText = (rawText) => {
  const entries = []
  let currentDay = ""
  const lines = rawText.split("\n")

  for (let line of lines) {
    line = line.trim()
    if (!line) continue

    // Detect day header
    const dayMatch = line.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[:\s]*$/i)
    if (dayMatch) {
      const day = dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1).toLowerCase()
      if (day === "Sunday") continue
      currentDay = day
      continue
    }

    // Try to find day within the line if no day header yet
    if (!currentDay) {
      for (const d of WEEKDAYS) {
        if (line.toLowerCase().includes(d.toLowerCase())) {
          currentDay = d
          const parts = line.split(new RegExp(d, "i"))
          line = parts.length > 1 ? parts[1].trim() : ""
          break
        }
      }
      if (!currentDay || !line) continue
    }

    // Time regex: handles HH:MM or H:MM, with AM/PM or 24h
    const timeRegex = /(\d{1,2})[:\s]?(?::?\s*(\d{2}))?\s*(am|pm)?\s*[–\-to]+\s*(\d{1,2})[:\s]?(?::?\s*(\d{2}))?\s*(am|pm)?/i
    const timeMatch = line.match(timeRegex)
    if (!timeMatch) continue

    let h1 = parseInt(timeMatch[1])
    let m1 = timeMatch[2] ? parseInt(timeMatch[2]) : 0
    let ampm1 = (timeMatch[3] || "").toLowerCase()
    let h2 = parseInt(timeMatch[4])
    let m2 = timeMatch[5] ? parseInt(timeMatch[5]) : 0
    let ampm2 = (timeMatch[6] || "").toLowerCase()

    if (ampm1 === "pm" && h1 !== 12) h1 += 12
    else if (ampm1 === "am" && h1 === 12) h1 = 0
    if (ampm2 === "pm" && h2 !== 12) h2 += 12
    else if (ampm2 === "am" && h2 === 12) h2 = 0

    const startTime = `${h1.toString().padStart(2, '0')}:${m1.toString().padStart(2, '0')}`
    const endTime = `${h2.toString().padStart(2, '0')}:${m2.toString().padStart(2, '0')}`

    const rest = (line.slice(0, timeMatch.index) + line.slice(timeMatch.index + timeMatch[0].length)).trim()
    const parts = rest.split(/[|]\s*/).map(p => p.trim().replace(/^\|+|\|+$/g, "").trim()).filter(p => p.length > 0)
    
    // Filter out parts that might be the time itself if split went wrong
    const finalParts = parts.filter(p => !p.match(/^\d{1,2}\s*(am|pm)?\s*[-–to]+\s*\d{1,2}\s*(am|pm)?$/i))

    const subject = finalParts[0] || ""
    const faculty = finalParts[1] || "TBA"
    const room = finalParts[2] || "TBA"

    if (!subject) continue

    entries.push({
      id: Math.random().toString(36).substr(2, 9),
      subject,
      day: currentDay,
      start_time: startTime,
      end_time: endTime,
      faculty: cleanVal(faculty),
      room: cleanVal(room),
    })
  }

  return entries
}
