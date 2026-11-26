# Learning Management System (LMS)

A modern, full-stack Learning Management System built with a Spring Boot Java backend, React frontend, MySQL database, and local Ollama AI assistance. This platform enables educational institutions to manage courses, assessments, student progress, and academic administration.

## Features

- **Role-Based Access Control**: Tailored dashboards for Students, Instructors, and Administrators.
- **Course & Content Management**: Manage courses, modules, syllabus, assignments, and announcements.
- **Assessments & Evaluation**:
  - Interactive quizzes with instant scoring.
  - Assignments with document submission and grading.
  - Internal marks tracking.
- **Local AI Assistant**: Integrated local AI assistant powered by Ollama (`llama3.2`) for academic help and tutoring without external API dependencies.
- **Student Engagement**: Track student achievements, progress, and performance badges.
- **Communication & Timetable**: Institution-wide announcements and shared academic schedules.

## Tech Stack

- **Backend**: Java 17, Spring Boot 3, Spring Data JPA, Spring Security
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons
- **Database**: MySQL (port 3306)
- **AI Engine**: Ollama (`llama3.2`)

## Getting Started

### Prerequisites

- Java JDK 17+
- Node.js (v18+) & npm
- MySQL Server (running on port 3306)
- Ollama (running locally with `llama3.2` installed: `ollama run llama3.2`)

### Quick Start (All-in-One)

Start backend, frontend, and Ollama with a single command:
```powershell
.\run.ps1
```
Or double-click:
```cmd
run.bat
```

To stop all services cleanly:
```cmd
stop.bat
```

### Manual Setup

1. **Backend**
   ```bash
   cd lms-backend
   .\mvnw spring-boot:run
   ```
   Backend starts at: `http://localhost:8080`

2. **Frontend**
   ```bash
   cd lms-frontend
   npm install
   npm run dev
   ```
   Frontend starts at: `http://localhost:5173`

## Default Credentials

- **Admin**: `admin@lms.edu` / `admin123`
- **Instructor**: `instructor@lms.edu` / `instructor123`
- **Student**: `student@lms.edu` / `student123`

## Project Demo Walkthrough

A 60-second walkthrough video demonstrating authentication, admin controls, instructor course workflows, local Ollama AI queries, and student dashboards:

<video src="https://github.com/VIGNESH-COLD/LMS/raw/main/lms_project_walkthrough.mp4" controls width="100%"></video>

[Watch Walkthrough Video (lms_project_walkthrough.mp4)](./lms_project_walkthrough.mp4)
