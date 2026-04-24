package com.lms.service;

import com.lms.dto.*;
import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final SubmissionRepository submissionRepository;

    public AssignmentResponse createAssignment(AssignmentRequest request, Long instructorId) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized");
        }

        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .course(course)
                .totalMarks(request.getTotalMarks())
                .deadline(request.getDeadline())
                .filePath(request.getFilePath())
                .build();

        assignment = assignmentRepository.save(assignment);
        return toResponse(assignment, null);
    }

    public AssignmentResponse updateAssignment(Long id, AssignmentRequest request, Long instructorId) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        if (!assignment.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized");
        }
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setTotalMarks(request.getTotalMarks());
        assignment.setDeadline(request.getDeadline());
        if (request.getFilePath() != null) {
            assignment.setFilePath(request.getFilePath());
        }
        assignment = assignmentRepository.save(assignment);
        return toResponse(assignment, null);
    }

    public List<AssignmentResponse> getAssignmentsByCourse(Long courseId, Long studentId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(a -> {
                    boolean submitted = studentId != null &&
                            submissionRepository.findByStudentIdAndAssignmentId(studentId, a.getId()).isPresent();
                    return toResponse(a, submitted);
                })
                .collect(Collectors.toList());
    }

    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return toResponse(assignment, null);
    }

    public void deleteAssignment(Long id, Long instructorId) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        if (!assignment.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized");
        }
        assignmentRepository.delete(assignment);
    }

    private AssignmentResponse toResponse(Assignment a, Boolean submitted) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .courseId(a.getCourse().getId())
                .courseName(a.getCourse().getTitle())
                .totalMarks(a.getTotalMarks())
                .deadline(a.getDeadline())
                .createdAt(a.getCreatedAt())
                .filePath(a.getFilePath())
                .submitted(submitted != null ? submitted : false)
                .build();
    }
}
