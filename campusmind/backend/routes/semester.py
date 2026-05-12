from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import SemesterSettings

router = APIRouter(prefix="/semester", tags=["Semester"])


class SemesterUpdate(BaseModel):
    course: str = "BCA"
    semester: int
    start_date: str
    end_date: str


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SemesterSettings).first()
    if not settings:
        return {"course": "BCA", "semester": 1, "start_date": str(date.today()), "end_date": str(date.today())}
    return {
        "course": settings.course,
        "semester": settings.semester,
        "start_date": str(settings.start_date),
        "end_date": str(settings.end_date),
    }


@router.put("/settings")
def update_settings(req: SemesterUpdate, db: Session = Depends(get_db)):
    try:
        parsed_start = date.fromisoformat(req.start_date)
        parsed_end = date.fromisoformat(req.end_date)
    except (ValueError, TypeError):
        return {"error": "Invalid date format. Use YYYY-MM-DD."}
    if parsed_start > parsed_end:
        return {"error": "Start date must be before end date."}
    settings = db.query(SemesterSettings).first()
    if not settings:
        settings = SemesterSettings(
            course=req.course,
            semester=req.semester,
            start_date=parsed_start,
            end_date=parsed_end,
        )
        db.add(settings)
    else:
        settings.course = req.course
        settings.semester = req.semester
        settings.start_date = parsed_start
        settings.end_date = parsed_end
    db.commit()
    return {"message": "Semester settings updated"}
