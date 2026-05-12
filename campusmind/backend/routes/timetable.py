import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import time, date
from database import get_db
from models import TimetableEntry
from services.timetable_parser import parse_timetable_pdf, parse_timetable_with_llm, _parse_with_regex, extract_text_from_pdf

router = APIRouter(prefix="/timetable", tags=["Timetable"])


class TimetableCreate(BaseModel):
    subject: str
    day: str
    start_time: str
    end_time: str
    faculty: str
    room: str


class TimetableText(BaseModel):
    text: str


def _bulk_insert(entries: list, db: Session):
    db.query(TimetableEntry).delete()
    for e in entries:
        try:
            db_entry = TimetableEntry(
                subject=e["subject"],
                day=e["day"],
                start_time=time.fromisoformat(e["start_time"]),
                end_time=time.fromisoformat(e["end_time"]),
                faculty=e["faculty"],
                room=e["room"],
            )
            db.add(db_entry)
        except (ValueError, KeyError):
            continue
    db.commit()


@router.post("/parse-text")
def parse_text(req: TimetableText, db: Session = Depends(get_db)):
    if not req.text.strip():
        return {"error": "No text provided"}
    text = req.text.strip()
    llm_entries = parse_timetable_with_llm(text)
    regex_entries = _parse_with_regex(text)
    entries = regex_entries if len(regex_entries) >= len(llm_entries) else llm_entries
    if not entries:
        return {"error": "Could not parse any timetable entries from the text. Make sure it includes days, times, and subjects."}
    _bulk_insert(entries, db)
    return {"message": f"Timetable updated with {len(entries)} entries", "count": len(entries)}


@router.post("/add")
def add_entry(entry: TimetableCreate, db: Session = Depends(get_db)):
    db_entry = TimetableEntry(
        subject=entry.subject,
        day=entry.day.capitalize(),
        start_time=time.fromisoformat(entry.start_time),
        end_time=time.fromisoformat(entry.end_time),
        faculty=entry.faculty,
        room=entry.room,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return {"message": "Entry added", "id": db_entry.id}


@router.post("/upload")
async def upload_timetable(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported"}

    fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    try:
        os.close(fd)
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        text = extract_text_from_pdf(temp_path)
        llm_entries = parse_timetable_with_llm(text) if text else []
        regex_entries = _parse_with_regex(text) if text else []
        entries = regex_entries if len(regex_entries) >= len(llm_entries) else llm_entries
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    if not entries:
        return {"error": "Could not parse any timetable entries from the PDF. Make sure the timetable is clear and text-based."}

    _bulk_insert(entries, db)

    return {"message": f"Timetable updated with {len(entries)} entries", "count": len(entries)}


@router.get("/today")
def get_today(db: Session = Depends(get_db)):
    day_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday"}
    today = day_map[date.today().weekday()]
    entries = db.query(TimetableEntry).filter(TimetableEntry.day == today).all()
    return entries


@router.get("/week")
def get_week(db: Session = Depends(get_db)):
    entries = db.query(TimetableEntry).order_by(TimetableEntry.day).all()
    return entries


@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}
