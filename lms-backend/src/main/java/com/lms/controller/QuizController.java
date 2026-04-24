package com.lms.controller;

import com.lms.config.JwtUtil;
import com.lms.dto.*;
import com.lms.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final JwtUtil jwtUtil;

    private Long getUserId(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    private String getUserRole(String authHeader) {
        return jwtUtil.extractRole(authHeader.substring(7));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<QuizResponse> createQuiz(
            @Valid @RequestBody QuizRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(quizService.createQuiz(request, getUserId(authHeader)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuizResponse>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizService.getQuizzesByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> getQuiz(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        boolean includeAnswers = "INSTRUCTOR".equals(getUserRole(authHeader));
        return ResponseEntity.ok(quizService.getQuizById(id, includeAnswers));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        quizService.deleteQuiz(id, getUserId(authHeader));
        return ResponseEntity.noContent().build();
    }
}
