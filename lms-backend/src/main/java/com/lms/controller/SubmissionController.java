package com.lms.controller;

import com.lms.config.JwtUtil;
import com.lms.dto.*;
import com.lms.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final JwtUtil jwtUtil;

    private Long getUserId(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    @PostMapping("/quiz")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submitQuiz(
            @RequestBody QuizSubmissionRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(submissionService.submitQuiz(request, getUserId(authHeader)));
    }

    @PostMapping("/assignment")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submitAssignment(
            @RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String authHeader) {
        Long assignmentId = Long.parseLong(body.get("assignmentId").toString());
        String content = (String) body.getOrDefault("content", null);
        String filePath = (String) body.getOrDefault("filePath", null);
        return ResponseEntity.ok(submissionService.submitAssignment(assignmentId, content, filePath, getUserId(authHeader)));
    }

    @PutMapping("/{id}/grade")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable Long id,
            @RequestBody GradeRequest request) {
        return ResponseEntity.ok(submissionService.gradeSubmission(id, request));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(submissionService.getSubmissionsByStudent(getUserId(authHeader)));
    }

    @GetMapping("/quiz/{quizId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<SubmissionResponse>> getQuizSubmissions(@PathVariable Long quizId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByQuiz(quizId));
    }

    @GetMapping("/assignment/{assignmentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<SubmissionResponse>> getAssignmentSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId));
    }
}
