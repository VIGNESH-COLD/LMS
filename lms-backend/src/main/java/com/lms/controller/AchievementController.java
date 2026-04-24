package com.lms.controller;

import com.lms.config.JwtUtil;
import com.lms.model.Achievement;
import com.lms.service.AchievementService;
import com.lms.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementService achievementService;
    private final JwtUtil jwtUtil;
    private final FileService fileService;

    // Student: view their own achievements
    @GetMapping("/student")
    public ResponseEntity<?> getMyAchievements(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        List<Achievement> achievements = achievementService.getByStudent(userId);
        return ResponseEntity.ok(achievements.stream().map(this::toMap).toList());
    }

    // Admin/Faculty: view a specific student's achievements by ID
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(achievementService.getByStudent(studentId).stream().map(this::toMap).toList());
    }

    // Admin/Faculty: view ALL student-submitted achievements
    @GetMapping("/all")
    public ResponseEntity<?> getAllSubmissions() {
        return ResponseEntity.ok(achievementService.getAllSubmissions().stream().map(this::toMap).toList());
    }

    // Admin: create achievement badge for a student (existing system)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> req) {
        Long studentId = Long.valueOf(req.get("studentId").toString());
        Long courseId = req.get("courseId") != null ? Long.valueOf(req.get("courseId").toString()) : null;
        Achievement a = achievementService.create(
            req.get("title").toString(),
            req.getOrDefault("description", "").toString(),
            req.getOrDefault("icon", "🏆").toString(),
            req.getOrDefault("badge", "GOLD").toString(),
            studentId, courseId
        );
        return ResponseEntity.ok(toMap(a));
    }

    // Student: submit own achievement with certificate file
    @PostMapping("/submit")
    public ResponseEntity<?> submitAchievement(
            @RequestHeader("Authorization") String token,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "awardType", required = false) String awardType,
            @RequestParam(value = "academicLevel", required = false) String academicLevel,
            @RequestParam(value = "awardedBy", required = false) String awardedBy,
            @RequestParam(value = "academicYear", required = false) String academicYear,
            @RequestParam(value = "eventDate", required = false) String eventDate,
            @RequestParam(value = "certificate", required = false) MultipartFile certificate) {
        try {
            Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
            String certFileName = null;
            if (certificate != null && !certificate.isEmpty()) {
                certFileName = fileService.uploadFile(certificate);
            }
            Achievement a = achievementService.submitByStudent(
                userId, title, description, awardType, academicLevel, awardedBy, certFileName, academicYear, eventDate
            );
            return ResponseEntity.ok(toMap(a));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin/Faculty: update status (APPROVED/REJECTED)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> req) {
        Achievement a = achievementService.updateStatus(id, req.get("status"));
        return ResponseEntity.ok(toMap(a));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        achievementService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private Map<String, Object> toMap(Achievement a) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", a.getId());
        map.put("title", a.getTitle());
        map.put("description", a.getDescription());
        map.put("icon", a.getIcon());
        map.put("badge", a.getBadge());
        map.put("awardType", a.getAwardType());
        map.put("academicLevel", a.getAcademicLevel());
        map.put("awardedBy", a.getAwardedBy());
        map.put("academicYear", a.getAcademicYear());
        map.put("eventDate", a.getEventDate());
        map.put("certificateFileName", a.getCertificateFileName());
        map.put("status", a.getStatus());
        map.put("submittedByStudent", a.isSubmittedByStudent());
        map.put("studentId", a.getStudent().getId());
        map.put("studentName", a.getStudent().getName());
        map.put("studentRollNumber", a.getStudent().getRollNumber());
        map.put("studentDepartment", a.getStudent().getDepartment());
        map.put("courseId", a.getCourse() != null ? a.getCourse().getId() : null);
        map.put("awardedAt", a.getAwardedAt());
        return map;
    }
}
