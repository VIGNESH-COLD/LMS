# Learning Management System (LMS)

A web-based Learning Management System built with **Spring Boot, React, and MySQL/PostgreSQL** to simplify academic management and improve communication between students and faculty.

## Features
- Role-based dashboards for students, instructors, and administrators.
- Course and learning material management.
- Assignment submissions, quizzes, and grading.
- Internal marks tracking.
- AI chatbot powered by Mistral AI.
- Announcements, academic calendars, and student achievements.

## Tech Stack
- **Backend:** Java, Spring Boot, Spring Data JPA, Spring Security
- **Frontend:** React.js, Vite, Tailwind CSS
- **Database:** MySQL / PostgreSQL

## Project Impact
- Centralizes academic resources and activities on a single platform.
- Simplifies assignment management, assessments, and communication.
- Provides AI-assisted support for student queries.

## Getting Started

**Backend**
```bash
cd lms-backend
./mvnw spring-boot:run
```

**Frontend**
```bash
cd lms-frontend
npm install
npm run dev
```

Configure your database settings in `application.properties` before starting the backend.

**Local URLs:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
