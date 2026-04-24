package com.lms.controller;

import com.lms.config.JwtUtil;
import com.lms.dto.*;
import com.lms.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final JwtUtil jwtUtil;

    private Long getUserId(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(assignmentService.createAssignment(request, getUserId(authHeader)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByCourse(
            @PathVariable Long courseId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long studentId = authHeader != null ? getUserId(authHeader) : null;
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId, studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, request, getUserId(authHeader)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        assignmentService.deleteAssignment(id, getUserId(authHeader));
        return ResponseEntity.noContent().build();
    }
}
