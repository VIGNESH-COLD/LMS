package com.lms.controller;

import com.lms.config.JwtUtil;

import com.lms.dto.*;
import com.lms.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        return ResponseEntity.ok(authService.getUserProfile(userId));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        
        authService.changePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
