from sqlalchemy import Column, Integer, String, Date, Boolean, Time, DateTime
from datetime import date, datetime
from database import Base


class TimetableEntry(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    day = Column(String, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    faculty = Column(String, nullable=False)
    room = Column(String, nullable=False)


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    deadline = Column(Date, nullable=False)
    priority = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SemesterSettings(Base):
    __tablename__ = "semester_settings"

    id = Column(Integer, primary_key=True, index=True)
    course = Column(String, nullable=False, default="BCA")
    semester = Column(Integer, nullable=False, default=1)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
