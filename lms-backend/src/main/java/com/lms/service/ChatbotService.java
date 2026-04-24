package com.lms.service;

import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class ChatbotService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final InternalMarkRepository internalMarkRepository;
    private final TimetableRepository timetableRepository;
    private final EventRepository eventRepository;
    private final AnnouncementRepository announcementRepository;
    private final AchievementRepository achievementRepository;
    private final DepartmentRepository departmentRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;

    @Value("${app.mistral.api-url:https://api.mistral.ai/v1/chat/completions}")
    private String mistralApiUrl;

    @Value("${app.mistral.api-key:EcUefyGHLhCczHMJCvspkOdU6lJSe73O}")
    private String mistralApiKey;

    @Value("${app.mistral.model:mistral-small-latest}")
    private String mistralModel;

    @Value("${app.ollama.base-url}")
    private String ollamaBaseUrl;

    @Value("${app.ollama.model}")
    private String ollamaModel;

    public String chat(String email, String userMessage, List<Map<String, String>> conversationHistory) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String systemPrompt = buildSystemPrompt(user);
        
        try {
            return callMistral(systemPrompt, userMessage, conversationHistory);
        } catch (Exception e) {
            log.warn("Mistral API failed, falling back to Ollama. Error: {}", e.getMessage());
            try {
                return callOllama(systemPrompt, userMessage, conversationHistory);
            } catch (Exception ollamaEx) {
                return "⚠️ Both Mistral and Ollama AI services failed.\nMistral Error: " + e.getMessage() + "\nOllama Error: " + ollamaEx.getMessage();
            }
        }
    }

    private String buildSystemPrompt(User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are RIT-LMS Assistant, the official AI chatbot for Rajalakshmi Institute of Technology's Learning Management System.\n");
        sb.append("Current date: ").append(LocalDate.now()).append("\n");
        sb.append("Current time: ").append(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))).append("\n");
        sb.append("Current day: ").append(LocalDate.now().getDayOfWeek().name()).append("\n\n");

        sb.append("=== CRITICAL INSTRUCTIONS ===\n");
        sb.append("YOU MUST ONLY USE THE DATA PROVIDED BELOW TO ANSWER QUESTIONS.\n");
        sb.append("DO NOT FABRICATE, GUESS, OR INVENT ANY DATA THAT IS NOT EXPLICITLY LISTED BELOW.\n");
        sb.append("If a question asks for information NOT present in the data below, respond EXACTLY with: 'I don't have that information in the system right now.'\n");
        sb.append("NEVER make up names, numbers, emails, marks, or any other details.\n\n");

        sb.append("=== CURRENT USER ===\n");
        sb.append("Name: ").append(user.getName()).append("\n");
        sb.append("Email: ").append(user.getEmail()).append("\n");
        sb.append("Role: ").append(user.getRole().name()).append("\n");

        switch (user.getRole()) {
            case STUDENT -> buildStudentContext(sb, user);
            case INSTRUCTOR -> buildInstructorContext(sb, user);
            case ADMIN -> buildAdminContext(sb, user);
        }

        sb.append("\n=== RESPONSE RULES ===\n");
        sb.append("1. ONLY answer based on the data sections above. If data is missing, say so honestly.\n");
        sb.append("2. Be concise and helpful. Use bullet points and markdown formatting.\n");
        if (user.getRole() != Role.ADMIN) {
            sb.append("3. NEVER reveal other users' personal information, passwords, or sensitive data.\n");
        }
        sb.append("4. For navigation help, guide users to the correct tab/section in the dashboard.\n");

        switch (user.getRole()) {
            case STUDENT -> {
                sb.append("5. You are assisting a STUDENT. Do not reveal other students' marks, admin stats, or sensitive faculty info.\n");
                sb.append("6. You can assist with: courses, marks, timetable, achievements, events, announcements.\n");
            }
            case INSTRUCTOR -> {
                sb.append("5. You are assisting a FACULTY member. Do not reveal admin-level system stats or other faculty's private data.\n");
                sb.append("6. You are an AI assistant, NOT a faculty member. Never say 'I teach' or 'my students'. Say 'your courses' or 'your students'.\n");
            }
            case ADMIN -> {
                sb.append("5. You are assisting a SYSTEM ADMIN who has full, unrestricted access to all data listed above.\n");
                sb.append("6. You are an AI assistant, NOT a faculty member or student. You represent the Admin Control Panel assistant.\n");
            }
        }

        sb.append("7. Keep responses under 300 words unless specifically asked for detailed information.\n");
        sb.append("8. If asked about features the system doesn't have, say it is not available yet.\n");
        sb.append("9. REMEMBER: Never invent data. Only use what is explicitly provided in the data sections above.\n");
        sb.append("10. For 'how to' questions about using the LMS, use the NAVIGATION GUIDE below.\n");

        sb.append("\n=== LMS NAVIGATION GUIDE ===\n");
        switch (user.getRole()) {
            case STUDENT -> {
                sb.append("The Student Dashboard has these tabs/sections:\n");
                sb.append("• **Subjects** tab: View all enrolled courses and course details\n");
                sb.append("• **Internal Marks** tab: View exam marks (Exam1, Exam2, Exam3, Total)\n");
                sb.append("• **Assignment** tab: View and submit assignments for enrolled courses\n");
                sb.append("• **Achievements** tab: View achievements and awards\n");
                sb.append("• **Events** tab: View upcoming college events\n");
                sb.append("• **Announcements** tab: View announcements from faculty/admin\n");
                sb.append("• **Timetable** tab: View weekly class timetable\n");
                sb.append("• **Student Detail** tab: View personal profile information\n");
                sb.append("• **Settings** tab: Change password\n");
                sb.append("• To take a quiz: Click on a course in the Subjects tab, then look for available quizzes\n");
            }
            case INSTRUCTOR -> {
                sb.append("The Instructor Dashboard has these tabs/sections:\n");
                sb.append("• **Courses** tab: View assigned courses and enrolled students count\n");
                sb.append("• **Marks** tab: Enter and manage internal marks for students (select a course first)\n");
                sb.append("• **Materials** tab: Upload and manage course materials like PDFs, slides, notes (select a course, then click 'Upload Material')\n");
                sb.append("• **Syllabus** tab: Manage syllabus topics and track completion (select a course)\n");
                sb.append("• **Timetable** tab: View your weekly class schedule\n");
                sb.append("• **Settings** tab: Change password\n");
                sb.append("• To create a Quiz: Go to the Courses tab and click 'Create Quiz'. Choose manual (add questions) or external link mode.\n");
                sb.append("• To create an Assignment: Go to the Courses tab and click 'Create Assignment'. Set title, description, marks, and deadline.\n");
                sb.append("• To upload course materials: Go to the 'Materials' tab, select a course, click 'Upload Material', choose a file and submit.\n");
            }
            case ADMIN -> {
                sb.append("The Admin Dashboard has sections for managing:\n");
                sb.append("• Users (Students, Faculty), Courses, Departments, Sections, Events, Announcements, Timetable\n");
                sb.append("• Admin can create, edit, and delete all system entities\n");
            }
        }

        sb.append("\n=== CONVERSATION STYLE ===\n");
        sb.append("- For greetings like 'hi', 'hello', 'hey': Reply with a SHORT friendly greeting (1-2 sentences max). Just say hello and ask how you can help. Do NOT list any data, statistics, courses, or details.\n");
        sb.append("- NEVER proactively dump data. Only show data when the user EXPLICITLY asks for it (e.g. 'list students', 'show courses', 'how many faculty').\n");
        sb.append("- Keep answers SHORT and DIRECT. Answer only what was asked, nothing more.\n");
        sb.append("- Example: If user says 'hi' -> reply 'Hello! How can I help you today?' and STOP. Do not add anything else.\n");

        return sb.toString();
    }

    private void buildStudentContext(StringBuilder sb, User user) {
        sb.append("Department: ").append(user.getDepartment() != null ? user.getDepartment() : "Not assigned").append("\n");
        sb.append("Roll Number: ").append(user.getRollNumber() != null ? user.getRollNumber() : "Not assigned").append("\n");
        sb.append("Year: ").append(user.getYear() != null ? user.getYear() : "-").append("\n");
        sb.append("Semester: ").append(user.getSemester() != null ? user.getSemester() : "-").append("\n");
        sb.append("Section: ").append(user.getSection() != null ? user.getSection() : "-").append("\n");

        // Enrolled courses
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(user.getId());
        sb.append("\n--- Enrolled Courses ---\n");
        if (enrollments.isEmpty()) {
            sb.append("No courses enrolled.\n");
        } else {
            for (Enrollment e : enrollments) {
                Course c = e.getCourse();
                sb.append("• ").append(c.getTitle())
                  .append(" (by ").append(c.getInstructor() != null ? c.getInstructor().getName() : "TBA").append(")\n");
            }
        }

        // Quizzes for enrolled courses
        sb.append("\n--- Quizzes ---\n");
        boolean hasQuizzes = false;
        for (Enrollment e : enrollments) {
            List<Quiz> quizzes = quizRepository.findByCourseId(e.getCourse().getId());
            for (Quiz q : quizzes) {
                hasQuizzes = true;
                sb.append("• ").append(q.getTitle())
                  .append(" (Course: ").append(e.getCourse().getTitle()).append(")")
                  .append(" | Marks: ").append(q.getTotalMarks() != null ? q.getTotalMarks() : "-")
                  .append(" | Deadline: ").append(q.getDeadline() != null ? q.getDeadline() : "Not set").append("\n");
            }
        }
        if (!hasQuizzes) sb.append("No quizzes available.\n");

        // Assignments for enrolled courses
        sb.append("\n--- Assignments ---\n");
        boolean hasAssignments = false;
        for (Enrollment e : enrollments) {
            List<Assignment> assignments = assignmentRepository.findByCourseId(e.getCourse().getId());
            for (Assignment a : assignments) {
                hasAssignments = true;
                sb.append("• ").append(a.getTitle())
                  .append(" (Course: ").append(e.getCourse().getTitle()).append(")")
                  .append(" | Marks: ").append(a.getTotalMarks() != null ? a.getTotalMarks() : "-")
                  .append(" | Deadline: ").append(a.getDeadline() != null ? a.getDeadline() : "Not set").append("\n");
            }
        }
        if (!hasAssignments) sb.append("No assignments available.\n");

        // Internal marks
        List<InternalMark> marks = internalMarkRepository.findByStudentId(user.getId());
        sb.append("\n--- Internal Marks ---\n");
        if (marks.isEmpty()) {
            sb.append("No marks published yet.\n");
        } else {
            for (InternalMark m : marks) {
                sb.append("• ").append(m.getCourse() != null ? m.getCourse().getTitle() : "Unknown")
                  .append(": Exam1=").append(m.getExam1() != null ? m.getExam1() : "-")
                  .append(", Exam2=").append(m.getExam2() != null ? m.getExam2() : "-")
                  .append(", Exam3=").append(m.getExam3() != null ? m.getExam3() : "-")
                  .append(", Total=").append(m.getTotal() != null ? m.getTotal() : "-").append("\n");
            }
        }

        // Full Week Timetable
        String today = LocalDate.now().getDayOfWeek().name();
        sb.append("\n--- Full Week Timetable (Today is ").append(today).append(") ---\n");
        List<Timetable> allTimetables = timetableRepository.findAllByOrderByDayOfWeekAscStartTimeAsc();
        if (allTimetables.isEmpty()) {
            sb.append("No timetable available.\n");
        } else {
            String currentDay = "";
            for (Timetable t : allTimetables) {
                if (!t.getDayOfWeek().equals(currentDay)) {
                    currentDay = t.getDayOfWeek();
                    sb.append("\n[").append(currentDay);
                    if (currentDay.equals(today)) sb.append(" - TODAY");
                    sb.append("]\n");
                }
                sb.append("• ").append(t.getCourse() != null ? t.getCourse().getTitle() : "?")
                  .append(" | ").append(t.getStartTime()).append("-").append(t.getEndTime())
                  .append(" | Room: ").append(t.getRoom() != null ? t.getRoom() : "-").append("\n");
            }
        }

        // Achievements
        List<Achievement> achievements = achievementRepository.findByStudentIdOrderByAwardedAtDesc(user.getId());
        if (!achievements.isEmpty()) {
            sb.append("\n--- Achievements ---\n");
            for (Achievement a : achievements.stream().limit(5).toList()) {
                sb.append("• ").append(a.getTitle()).append(" [").append(a.getStatus()).append("]\n");
            }
        }

        appendEventsAndAnnouncements(sb, "STUDENT");
    }

    private void buildInstructorContext(StringBuilder sb, User user) {
        sb.append("Department: ").append(user.getDepartment() != null ? user.getDepartment() : "Not assigned").append("\n");

        // Instructor's courses
        List<Course> courses = courseRepository.findByInstructorId(user.getId());
        sb.append("\n--- My Courses ---\n");
        if (courses.isEmpty()) {
            sb.append("No courses assigned.\n");
        } else {
            for (Course c : courses) {
                long enrolledCount = enrollmentRepository.findByCourseId(c.getId()).size();
                sb.append("• ").append(c.getTitle())
                  .append(" (").append(enrolledCount).append(" students enrolled)\n");
            }
        }

        // Quizzes for instructor's courses
        sb.append("\n--- Quizzes ---\n");
        boolean hasQuizzes = false;
        for (Course c : courses) {
            List<Quiz> quizzes = quizRepository.findByCourseId(c.getId());
            for (Quiz q : quizzes) {
                hasQuizzes = true;
                sb.append("• ").append(q.getTitle())
                  .append(" (Course: ").append(c.getTitle()).append(")")
                  .append(" | Marks: ").append(q.getTotalMarks() != null ? q.getTotalMarks() : "-")
                  .append(" | Deadline: ").append(q.getDeadline() != null ? q.getDeadline() : "Not set").append("\n");
            }
        }
        if (!hasQuizzes) sb.append("No quizzes created.\n");

        // Assignments for instructor's courses
        sb.append("\n--- Assignments ---\n");
        boolean hasAssignments = false;
        for (Course c : courses) {
            List<Assignment> assignments = assignmentRepository.findByCourseId(c.getId());
            for (Assignment a : assignments) {
                hasAssignments = true;
                sb.append("• ").append(a.getTitle())
                  .append(" (Course: ").append(c.getTitle()).append(")")
                  .append(" | Marks: ").append(a.getTotalMarks() != null ? a.getTotalMarks() : "-")
                  .append(" | Deadline: ").append(a.getDeadline() != null ? a.getDeadline() : "Not set").append("\n");
            }
        }
        if (!hasAssignments) sb.append("No assignments created.\n");

        // Full Week Timetable
        String today = LocalDate.now().getDayOfWeek().name();
        sb.append("\n--- Full Week Schedule (Today is ").append(today).append(") ---\n");
        List<Timetable> allTimetables = timetableRepository.findAllByOrderByDayOfWeekAscStartTimeAsc();
        List<Timetable> myTimetable = allTimetables.stream()
                .filter(t -> t.getCourse() != null && t.getCourse().getInstructor() != null
                        && t.getCourse().getInstructor().getId().equals(user.getId()))
                .toList();
        if (myTimetable.isEmpty()) {
            sb.append("No classes scheduled.\n");
        } else {
            String currentDay = "";
            for (Timetable t : myTimetable) {
                if (!t.getDayOfWeek().equals(currentDay)) {
                    currentDay = t.getDayOfWeek();
                    sb.append("\n[").append(currentDay);
                    if (currentDay.equals(today)) sb.append(" - TODAY");
                    sb.append("]\n");
                }
                sb.append("• ").append(t.getCourse().getTitle())
                  .append(" | ").append(t.getStartTime()).append("-").append(t.getEndTime())
                  .append(" | Room: ").append(t.getRoom() != null ? t.getRoom() : "-").append("\n");
            }
        }

        appendEventsAndAnnouncements(sb, "INSTRUCTOR");
    }

    private void buildAdminContext(StringBuilder sb, User user) {
        // System stats
        long totalStudents = userRepository.findByRole(Role.STUDENT).size();
        long totalFaculty = userRepository.findByRole(Role.INSTRUCTOR).size();
        long totalCourses = courseRepository.count();
        List<Department> departments = departmentRepository.findAll();

        sb.append("\n--- System Statistics ---\n");
        sb.append("Total Students: ").append(totalStudents).append("\n");
        sb.append("Total Faculty: ").append(totalFaculty).append("\n");
        sb.append("Total Courses: ").append(totalCourses).append("\n");
        sb.append("Total Departments: ").append(departments.size()).append(" (");
        
        sb.append(departments.stream().map(Department::getName).collect(Collectors.joining(", ")));
        sb.append(")\n");

        // Recent courses
        List<Course> courses = courseRepository.findAll();
        if (!courses.isEmpty()) {
            sb.append("\n--- All Courses ---\n");
            for (Course c : courses.stream().limit(15).toList()) {
                sb.append("• ").append(c.getTitle())
                  .append(" (Instructor: ").append(c.getInstructor() != null ? c.getInstructor().getName() : "TBA").append(")\n");
            }
        }

        // Faculty list
        List<User> faculty = userRepository.findByRole(Role.INSTRUCTOR);
        if (!faculty.isEmpty()) {
            sb.append("\n--- Faculty Members ---\n");
            for (User f : faculty) {
                sb.append("• Name: ").append(f.getName())
                  .append(" | Email: ").append(f.getEmail())
                  .append(" | Dept: ").append(f.getDepartment() != null ? f.getDepartment() : "-").append("\n");
            }
        }

        // Student list
        List<User> students = userRepository.findByRole(Role.STUDENT);
        if (!students.isEmpty()) {
            sb.append("\n--- Registered Students ---\n");
            for (User s : students) {
                sb.append("• Name: ").append(s.getName())
                  .append(" | Email: ").append(s.getEmail())
                  .append(" | Roll: ").append(s.getRollNumber() != null ? s.getRollNumber() : "N/A")
                  .append(" | Dept: ").append(s.getDepartment() != null ? s.getDepartment() : "N/A")
                  .append(" | Yr: ").append(s.getYear() != null ? s.getYear() : "N/A")
                  .append(" | Sem: ").append(s.getSemester() != null ? s.getSemester() : "N/A")
                  .append(" | Sec: ").append(s.getSection() != null ? s.getSection() : "N/A").append("\n");
            }
        }

        appendEventsAndAnnouncements(sb, "ALL");
    }

    private void appendEventsAndAnnouncements(StringBuilder sb, String role) {
        // Events
        List<Event> events = eventRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getEventDate() == null || b.getEventDate() == null) return 0;
                    return b.getEventDate().compareTo(a.getEventDate());
                })
                .limit(5).toList();
        if (!events.isEmpty()) {
            sb.append("\n--- Upcoming Events ---\n");
            for (Event e : events) {
                sb.append("• ").append(e.getTitle())
                  .append(" (").append(e.getEventDate() != null ? e.getEventDate() : "TBD").append(")\n");
            }
        }

        // Announcements
        List<Announcement> announcements = announcementRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(5).toList();
        if (!announcements.isEmpty()) {
            sb.append("\n--- Recent Announcements ---\n");
            for (Announcement a : announcements) {
                sb.append("• ").append(a.getTitle()).append(": ").append(a.getContent() != null ? a.getContent() : "").append("\n");
            }
        }
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private String callMistral(String systemPrompt, String userMessage, List<Map<String, String>> conversationHistory) {
        RestTemplate restTemplate = new RestTemplate();

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        if (conversationHistory != null) {
            int start = Math.max(0, conversationHistory.size() - 20);
            for (Map<String, String> msg : conversationHistory.subList(start, conversationHistory.size())) {
                if (msg.containsKey("role") && msg.containsKey("content")) {
                    messages.add(Map.of("role", msg.get("role"), "content", msg.get("content")));
                }
            }
        }

        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", mistralModel);
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.3);
        requestBody.put("top_p", 0.9);
        requestBody.put("max_tokens", 512);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(mistralApiKey);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(mistralApiUrl, entity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            throw new RuntimeException("Unexpected response from Mistral API");
        } catch (org.springframework.web.client.RestClientResponseException e) {
            log.error("Mistral API HTTP Error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Mistral API error: " + e.getResponseBodyAsString(), e);
        }
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private String callOllama(String systemPrompt, String userMessage, List<Map<String, String>> conversationHistory) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));

            // Add conversation history (limit to last 10 exchanges)
            if (conversationHistory != null) {
                int start = Math.max(0, conversationHistory.size() - 20);
                messages.addAll(conversationHistory.subList(start, conversationHistory.size()));
            }

            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", ollamaModel);
            requestBody.put("messages", messages);
            requestBody.put("stream", false);
            requestBody.put("options", Map.of(
                "temperature", 0.3,
                "num_predict", 512,
                "top_p", 0.9
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ollamaBaseUrl + "/api/chat", entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("message")) {
                Map<String, Object> message = (Map<String, Object>) response.getBody().get("message");
                return (String) message.get("content");
            }

            return "I received an unexpected response. Please try again.";
        } catch (Exception e) {
            log.error("Ollama API error: {}", e.getMessage());
            return "⚠️ I'm unable to connect to the AI service right now. Please make sure Ollama is running (`ollama serve`) and try again.";
        }
    }
}
