# University Kit 🎓🤖

**University Kit** is a premium, AI-powered university assistant designed to streamline your academic life. Built with a modern tech stack, it provides students with a powerful dashboard to manage classes, assignments, attendance, and study materials with the help of artificial intelligence.

![University Kit Banner](https://images.unsplash.com/photo-1523050335456-c38730b0ebf4?auto=format&fit=crop&q=80&w=2000)

## ✨ Features

### 📊 Dynamic Dashboard
- Get a bird's-eye view of your academic progress.
- Real-time tracking of today's classes and pending assignments.
- Daily motivational quotes to keep you inspired.

### 📅 Smart Timetable
- **Manual Add**: Quickly add classes to your schedule.
- **PDF Upload**: Upload your university timetable PDF, and University Kit will automatically extract and populate your schedule.
- **Text Parse**: Paste your timetable text for instant parsing.

### 📝 AI Notes & Viva Generator
- **Notes AI**: Ask questions about your study materials and get instant, context-aware answers.
- **Viva Generator**: Automatically generate Viva questions, MCQs, or short-answer questions from your PDFs or specific topics to prepare for exams.

### 📉 Attendance Tracker
- Calculate your current attendance percentage.
- Predict how many classes you can skip or need to attend to meet your target (e.g., 75%).
- Visual risk levels (Safe, Warning, Danger) to keep you on track.

### 📋 Assignment Management
- Track pending and completed tasks with priority levels.
- Smooth transitions and high-readability design for effortless task management.

## 🚀 Tech Stack

### Frontend
- **React (Vite)**: Modern, lightning-fast UI development.
- **Tailwind CSS**: Custom, premium styling with a focus on readability and glassmorphism.
- **React Icons & Framer Motion**: Dynamic animations and beautiful iconography.

### Backend
- **FastAPI (Python)**: High-performance, asynchronous API.
- **ChromaDB**: Vector database for RAG (Retrieval-Augmented Generation) to power the AI features.
- **PyPDF2**: Intelligent PDF parsing for timetable and notes extraction.
- **SQLite**: Reliable relational data storage.

## 🛠️ Setup Instructions

### Backend
1. Navigate to the backend directory:
   ```bash
   cd campusmind/backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python main.py
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd campusmind/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎨 UI & Design
University Kit features a custom-designed **Premium Light Theme** optimized for long study sessions. It uses a soft color palette (`Rose`, `Pink`, and `Slate`) to ensure maximum readability and a stunning visual experience.

---
*Created with ❤️ for students who want to master their university life.*
