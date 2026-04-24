package com.lms.controller;

import com.lms.config.JwtUtil;
import com.lms.service.CourseMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/course-materials")
@RequiredArgsConstructor
public class CourseMaterialController {

    private final CourseMaterialService materialService;
    private final JwtUtil jwtUtil;

    private Long getUserId(String authHeader) {
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestHeader("Authorization") String authHeader) {
        try {
            var material = materialService.uploadMaterial(courseId, getUserId(authHeader), title, description, file);
            return ResponseEntity.ok(Map.of(
                    "message", "Material uploaded successfully",
                    "id", material.getId()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Map<String, Object>>> getMaterialsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(materialService.getMaterialsByCourse(courseId));
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Map<String, Object>>> getMyMaterials(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(materialService.getMaterialsByInstructor(getUserId(authHeader)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteMaterial(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            materialService.deleteMaterial(id, getUserId(authHeader));
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Delete failed"));
        }
    }
}
