from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes.timetable import router as timetable_router
from routes.assignments import router as assignments_router
from routes.notes import router as notes_router
from routes.attendance import router as attendance_router
from routes.viva import router as viva_router
from routes.semester import router as semester_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusMind AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(timetable_router)
app.include_router(assignments_router)
app.include_router(notes_router)
app.include_router(attendance_router)
app.include_router(viva_router)
app.include_router(semester_router)


@app.get("/")
def root():
    return {"message": "CampusMind AI API is running"}
