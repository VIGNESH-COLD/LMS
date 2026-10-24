# RIT Learning Management System (LMS)

A comprehensive Learning Management System built with a Spring Boot Java backend and a React/Vite frontend. This application provides a full-featured platform for educational institutions to manage courses, users, materials, and evaluations.

##  Features

- **Role-Based Access Control**: Separate, customized dashboards for Students, Instructors, and Administrators.
- **Course Management**: Manage courses, sections, syllabus, and course materials (documents, videos, images).
- **Assessment & Evaluation**:
  - Assignments with file submissions and grading.
  - Quizzes with automated scoring.
  - Internal marks tracking.
- **AI Chatbot Integration**: Integrated Mistral AI chatbot service to assist students and staff.
- **Communication Tools**: System-wide announcements and shared calendars for events and timetables.
- **Student Engagement**: Track student achievements.

## Technology Stack

**Backend (`/lms-backend`)**:
- Java Spring Boot
- Spring Data JPA (Hibernate)
- Spring Security for Authentication
- MySQL / PostgreSQL (Configured via `application.properties`)

**Frontend (`/lms-frontend`)**:
- React.js
- Vite (Build Tool)
- Tailwind CSS (Styling)

## Getting Started

### Prerequisites
- JDK 17+
- Node.js & npm
- Maven
- MySQL / PostgreSQL Database

### 1. Setting up the Backend
1. Navigate to the `lms-backend` directory:
   ```bash
   cd lms-backend
   ```
2. Update your database configuration in `src/main/resources/application.properties`.
3. Run the application:
   ```bash
   .\mvnw spring-boot:run
   ```
   *(The backend server will typically start on `http://localhost:8080`)*

### 2. Setting up the Frontend
1. Navigate to the `lms-frontend` directory:
   ```bash
   cd lms-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *(The frontend will typically be accessible at `http://localhost:5173`)*

## Default Login Credentials
*(If populated by your initialization scripts)*
- **Admin**: `admin@lms.edu` / `admin123`
