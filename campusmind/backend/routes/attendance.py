from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import TimetableEntry, SemesterSettings

router = APIRouter(prefix="/attendance", tags=["Attendance"])


class AttendanceRequest(BaseModel):
    subject: str = ""
    total_classes: int
    attended: int
    remaining_classes: int
    target_percentage: float = 75.0


@router.get("/subjects")
def get_subjects(db: Session = Depends(get_db)):
    subjects = db.query(TimetableEntry.subject).distinct().order_by(TimetableEntry.subject).all()
    return [s[0] for s in subjects]


@router.get("/remaining/{subject}")
def get_remaining(subject: str, db: Session = Depends(get_db)):
    settings = db.query(SemesterSettings).first()
    if not settings or not settings.end_date:
        return {"remaining": 0, "subject": subject}

    entries = db.query(TimetableEntry).filter(TimetableEntry.subject == subject).all()
    if not entries:
        return {"remaining": 0, "subject": subject}

    days_of_week = set(e.day for e in entries)
    # Start from tomorrow to avoid double-counting today's classes
    tomorrow = date.today() + timedelta(days=1)
    end = settings.end_date

    if tomorrow > end:
        return {"remaining": 0, "subject": subject}

    remaining = 0
    current = tomorrow
    while current <= end:
        day_name = current.strftime("%A")
        if day_name in days_of_week:
            remaining += 1
        current += timedelta(days=1)

    return {"remaining": remaining, "subject": subject}


@router.post("/calculate")
def calculate_attendance(req: AttendanceRequest):
    if req.total_classes <= 0:
        return {"error": "Total classes must be greater than 0"}
    if req.attended > req.total_classes:
        return {"error": "Attended cannot exceed total classes"}
    if req.attended < 0:
        return {"error": "Attended classes cannot be negative"}

    current_pct = round((req.attended / req.total_classes) * 100, 2)
    total_remaining = req.remaining_classes
    future_total = req.total_classes + total_remaining

    # Calculate how many of the remaining classes you must attend to reach target
    needed_to_reach_target = 0
    if future_total > 0:
        for i in range(total_remaining + 1):
            future_pct = (req.attended + i) / future_total * 100
            if future_pct >= req.target_percentage:
                needed_to_reach_target = i
                break
        else:
            needed_to_reach_target = total_remaining + 1

    # Calculate max classes you can skip while still meeting target
    # (attend all remaining minus i, check if still >= target)
    can_skip = 0
    if future_total > 0:
        for i in range(total_remaining + 1):
            attended_if_skip_i = req.attended + (total_remaining - i)
            future_pct = attended_if_skip_i / future_total * 100
            if future_pct >= req.target_percentage:
                can_skip = i
            else:
                break

    if current_pct >= req.target_percentage:
        risk = "safe"
    elif current_pct >= req.target_percentage - 10:
        risk = "warning"
    else:
        risk = "danger"

    return {
        "current_percentage": current_pct,
        "target_percentage": req.target_percentage,
        "classes_needed_to_reach_target": max(0, needed_to_reach_target),
        "classes_you_can_skip": can_skip,
        "risk_level": risk,
    }

