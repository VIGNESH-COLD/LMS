package com.lms.service;

import com.lms.dto.RegisterRequest;
import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .department(request.getDepartment())
                .section(request.getSection())
                .rollNumber(request.getRollNumber())
                .year(request.getYear())
                .semester(request.getSemester())
                .phoneNumber(request.getPhoneNumber())
                .build();
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public User updateUser(Long userId, RegisterRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setDepartment(request.getDepartment());
        user.setSection(request.getSection());
        user.setRollNumber(request.getRollNumber());
        user.setYear(request.getYear());
        user.setSemester(request.getSemester());
        user.setPhoneNumber(request.getPhoneNumber());
        
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public void allocateCourseToInstructor(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));
        course.setInstructor(instructor);
        courseRepository.save(course);
    }

    public void bulkEnrollStudents(Long courseId, List<Long> studentIds) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        List<Enrollment> enrollments = new ArrayList<>();
        for (Long studentId : studentIds) {
            if (!enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
                User student = userRepository.findById(studentId).orElse(null);
                if (student != null) {
                    enrollments.add(Enrollment.builder()
                            .student(student)
                            .course(course)
                            .build());
                }
            }
        }
        enrollmentRepository.saveAll(enrollments);
    }

    public void extendDeadline(Long assignmentId, LocalDateTime newDeadline) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setDeadline(newDeadline);
        assignmentRepository.save(assignment);
    }

    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalStudents", userRepository.findByRole(Role.STUDENT).size());
        stats.put("totalInstructors", userRepository.findByRole(Role.INSTRUCTOR).size());
        stats.put("totalCourses", courseRepository.count());
        stats.put("totalAssignments", assignmentRepository.count());
        stats.put("totalSubmissions", submissionRepository.count());
        return stats;
    }
}
