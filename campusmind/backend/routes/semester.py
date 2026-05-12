from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import SemesterSettings

router = APIRouter(prefix="/semester", tags=["Semester"])


class SemesterUpdate(BaseModel):
    semester: int
    start_date: str
    end_date: str


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SemesterSettings).first()
    if not settings:
        return {"semester": 1, "start_date": str(date.today()), "end_date": str(date.today())}
    return {
        "semester": settings.semester,
        "start_date": str(settings.start_date),
        "end_date": str(settings.end_date),
    }


@router.put("/settings")
def update_settings(req: SemesterUpdate, db: Session = Depends(get_db)):
    settings = db.query(SemesterSettings).first()
    if not settings:
        settings = SemesterSettings(
            semester=req.semester,
            start_date=date.fromisoformat(req.start_date),
            end_date=date.fromisoformat(req.end_date),
        )
        db.add(settings)
    else:
        settings.semester = req.semester
        settings.start_date = date.fromisoformat(req.start_date)
        settings.end_date = date.fromisoformat(req.end_date)
    db.commit()
    return {"message": "Semester settings updated"}
