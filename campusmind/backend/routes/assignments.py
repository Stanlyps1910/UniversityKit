from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from database import get_db
from models import Assignment

router = APIRouter(prefix="/assignments", tags=["Assignments"])


class AssignmentCreate(BaseModel):
    title: str
    subject: str
    deadline: str
    priority: str = "medium"


@router.post("/add")
def add_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    db_entry = Assignment(
        title=assignment.title,
        subject=assignment.subject,
        deadline=date.fromisoformat(assignment.deadline),
        priority=assignment.priority.lower(),
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return {"message": "Assignment added", "id": db_entry.id}


@router.get("/pending")
def get_pending(db: Session = Depends(get_db)):
    entries = (
        db.query(Assignment)
        .filter(Assignment.is_completed == False)
        .order_by(Assignment.deadline.asc())
        .all()
    )
    return entries


@router.get("/completed")
def get_completed(db: Session = Depends(get_db)):
    entries = (
        db.query(Assignment)
        .filter(Assignment.is_completed == True)
        .order_by(Assignment.deadline.desc())
        .all()
    )
    return entries


@router.patch("/{assignment_id}/complete")
def mark_complete(assignment_id: int, db: Session = Depends(get_db)):
    entry = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Assignment not found")
    entry.is_completed = True
    db.commit()
    return {"message": "Marked as complete"}


@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, db: Session = Depends(get_db)):
    entry = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(entry)
    db.commit()
    return {"message": "Assignment deleted"}
