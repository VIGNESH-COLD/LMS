package com.lms.service;

import com.lms.model.Course;
import com.lms.model.Enrollment;
import com.lms.model.User;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public void enroll(Long studentId, Long courseId) {
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Already enrolled in this course");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();

        enrollmentRepository.save(enrollment);
    }

    public void unenroll(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Not enrolled in this course"));
        enrollmentRepository.delete(enrollment);
    }

    public boolean isEnrolled(Long studentId, Long courseId) {
        return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }
}
