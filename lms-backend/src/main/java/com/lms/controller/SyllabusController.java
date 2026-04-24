package com.lms.controller;

import com.lms.model.SyllabusItem;
import com.lms.service.SyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/syllabus")
@RequiredArgsConstructor
public class SyllabusController {

    private final SyllabusService syllabusService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(syllabusService.getByCourse(courseId).stream().map(this::toMap).toList());
    }

    @GetMapping("/course/{courseId}/progress")
    public ResponseEntity<?> getProgress(@PathVariable Long courseId) {
        return ResponseEntity.ok(syllabusService.getProgress(courseId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> req) {
        Long courseId = Long.valueOf(req.get("courseId").toString());
        Integer orderIndex = req.get("orderIndex") != null ? Integer.valueOf(req.get("orderIndex").toString()) : 0;
        SyllabusItem item = syllabusService.create(
            courseId,
            req.get("topic").toString(),
            req.getOrDefault("description", "").toString(),
            orderIndex
        );
        return ResponseEntity.ok(toMap(item));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(toMap(syllabusService.toggleComplete(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        syllabusService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private Map<String, Object> toMap(SyllabusItem s) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", s.getId());
        map.put("courseId", s.getCourse().getId());
        map.put("courseTitle", s.getCourse().getTitle());
        map.put("topic", s.getTopic());
        map.put("description", s.getDescription());
        map.put("completed", s.getCompleted());
        map.put("completedDate", s.getCompletedDate());
        map.put("orderIndex", s.getOrderIndex());
        return map;
    }
}
