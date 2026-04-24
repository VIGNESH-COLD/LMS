package com.lms.controller;

import com.lms.config.JwtUtil;
import com.lms.dto.AnalyticsResponse;
import com.lms.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final JwtUtil jwtUtil;

    private Long getUserId(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<AnalyticsResponse> getInstructorAnalytics(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(analyticsService.getInstructorAnalytics(getUserId(authHeader)));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AnalyticsResponse> getStudentAnalytics(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(getUserId(authHeader)));
    }
}
