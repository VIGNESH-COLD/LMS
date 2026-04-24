package com.lms.controller;

import com.lms.model.Announcement;
import com.lms.service.AnnouncementService;
import com.lms.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(announcementService.getAll().stream().map(this::toMap).toList());
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<?> getForRole(@PathVariable String role) {
        return ResponseEntity.ok(announcementService.getForRole(role).stream().map(this::toMap).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> req, @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        Announcement a = announcementService.create(
            req.get("title").toString(),
            req.get("content").toString(),
            req.getOrDefault("priority", "MEDIUM").toString(),
            req.getOrDefault("targetRole", "ALL").toString(),
            userId
        );
        return ResponseEntity.ok(toMap(a));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private Map<String, Object> toMap(Announcement a) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", a.getId());
        map.put("title", a.getTitle());
        map.put("content", a.getContent());
        map.put("priority", a.getPriority());
        map.put("targetRole", a.getTargetRole());
        map.put("createdBy", a.getCreatedBy() != null ? a.getCreatedBy().getName() : null);
        map.put("createdAt", a.getCreatedAt());
        return map;
    }
}
