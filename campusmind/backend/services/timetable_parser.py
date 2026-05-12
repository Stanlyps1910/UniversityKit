import fitz
import json
import re
import os
import uuid
from services.llm_service import ask_llm

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()
    return full_text.strip()


def _clean_val(val: str) -> str:
    val = val.strip().strip('|').strip()
    return "TBA" if not val or val.lower() in ("none", "n/a", "tbd", "") else val


def _parse_with_regex(raw_text: str) -> list:
    entries = []
    current_day = ""
    lines = raw_text.split("\n")

    for line in lines:
        line = line.strip()
        if not line:
            continue

        day_match = re.match(r"^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[:\s]*$", line.strip("*-#").strip(), re.IGNORECASE)
        if day_match:
            day = day_match.group(1).capitalize()
            if day == "Sunday":
                continue
            current_day = day
            continue

        if not current_day:
            for d in WEEKDAYS:
                if d.lower() in line.lower():
                    current_day = d
                    parts = re.split(rf"(?i){d}[:\s]*", line, maxsplit=1)
                    line = parts[-1].strip() if len(parts) > 1 else ""
                    if not line:
                        continue
                    break
            if not current_day:
                continue

        time_match = re.search(
            r"(\d{1,2})[:\s]?(?::?\s*(\d{2}))?\s*(am|pm)?\s*[–\-to]+\s*(\d{1,2})[:\s]?(?::?\s*(\d{2}))?\s*(am|pm)?",
            line, re.IGNORECASE
        )
        if not time_match:
            time_match = re.search(
                r"(\d{1,2})[:\s]?(?::?\s*(\d{2}))?\s*(am|pm)?\s*[-–to]+\s*(\d{1,2})[:\s]?(?::?\s*(\d{2}))?\s*(am|pm)?",
                line, re.IGNORECASE
            )
        if not time_match:
            continue

        h1 = int(time_match.group(1))
        m1 = int(time_match.group(2)) if time_match.group(2) else 0
        ampm1 = (time_match.group(3) or "").lower()
        h2 = int(time_match.group(4))
        m2 = int(time_match.group(5)) if time_match.group(5) else 0
        ampm2 = (time_match.group(6) or "").lower()

        if ampm1 == "pm" and h1 != 12:
            h1 += 12
        elif ampm1 == "am" and h1 == 12:
            h1 = 0
        if ampm2 == "pm" and h2 != 12:
            h2 += 12
        elif ampm2 == "am" and h2 == 12:
            h2 = 0

        start_time = f"{h1:02d}:{m1:02d}"
        end_time = f"{h2:02d}:{m2:02d}"

        rest = line[:time_match.start()] + line[time_match.end():]
        parts = [p.strip().strip("|").strip() for p in re.split(r"[|]\s*", rest) if p.strip()]
        parts = [p for p in parts if p and not re.match(r"^\d{1,2}\s*(am|pm)?\s*[-–to]+\s*\d{1,2}\s*(am|pm)?$", p, re.IGNORECASE)]

        subject = parts[0] if len(parts) > 0 else ""
        faculty = parts[1] if len(parts) > 1 else ""
        room = parts[2] if len(parts) > 2 else ""

        if not subject:
            continue

        entries.append({
            "subject": subject,
            "day": current_day,
            "start_time": start_time,
            "end_time": end_time,
            "faculty": _clean_val(faculty),
            "room": _clean_val(room),
        })

    return entries


def parse_timetable_with_llm(raw_text: str) -> list:
    prompt = f"""You are a timetable parser. Extract all class/schedule entries from the following timetable text and return ONLY a valid JSON array. No other text.

Each entry must have these exact fields:
- "subject": the course/subject name (required)
- "day": one of Monday, Tuesday, Wednesday, Thursday, Friday, Saturday (required)
- "start_time": in HH:MM 24-hour format (required)
- "end_time": in HH:MM 24-hour format (required)
- "faculty": the instructor's name, or "TBA" if not found
- "room": the room number, or "TBA" if not found

Example output format:
[
  {{"subject": "Data Structures", "day": "Monday", "start_time": "09:00", "end_time": "10:00", "faculty": "Dr. Sharma", "room": "201"}},
  {{"subject": "DBMS", "day": "Monday", "start_time": "10:00", "end_time": "11:00", "faculty": "Prof. Verma", "room": "201"}}
]

Rules:
- Infer the day from section headers or context
- Convert all times to 24-hour HH:MM format
- If a line contains "lab", keep it as part of the subject name
- Do NOT include Sunday entries
- Return [] if nothing can be parsed

Timetable text:
{raw_text}

JSON array:"""

    response = ask_llm(prompt).strip()

    for prefix in ["```json", "```json\n", "```"]:
        if response.startswith(prefix):
            response = response[len(prefix):]
    for suffix in ["```", "\n```"]:
        if response.endswith(suffix):
            response = response[:-len(suffix)]
    response = response.strip()

    try:
        entries = json.loads(response)
    except (json.JSONDecodeError, ValueError):
        try:
            entries = json.loads(f"[{response}]")
        except (json.JSONDecodeError, ValueError):
            try:
                import re as _re
                objects = _re.findall(r'\{(?:[^{}]|(?:\{[^{}]*\}))*\}', response, _re.DOTALL)
                entries = [json.loads(o) for o in objects] if objects else []
            except (json.JSONDecodeError, ValueError):
                return []

    if not isinstance(entries, list):
        return []

    validated = []
    for e in entries:
        if not isinstance(e, dict):
            continue
        day = e.get("day", "").capitalize()
        if day not in WEEKDAYS:
            continue
        validated.append({
            "subject": str(e.get("subject", "")).strip(),
            "day": day,
            "start_time": str(e.get("start_time", "")).strip(),
            "end_time": str(e.get("end_time", "")).strip(),
            "faculty": _clean_val(str(e.get("faculty", "TBA"))),
            "room": _clean_val(str(e.get("room", "TBA"))),
        })
    return validated


def parse_timetable_pdf(file_path: str) -> list:
    text = extract_text_from_pdf(file_path)
    if not text:
        return []
    entries = parse_timetable_with_llm(text)
    if entries:
        return entries
    return _parse_with_regex(text)
