package com.lms.controller;

import com.lms.model.SemesterCalendar;
import com.lms.service.SemesterCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/semester-calendar")
@RequiredArgsConstructor
public class SemesterCalendarController {

    private final SemesterCalendarService semesterCalendarService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(semesterCalendarService.getAll().stream().map(this::toMap).toList());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcoming() {
        return ResponseEntity.ok(semesterCalendarService.getUpcoming().stream().map(this::toMap).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> req) {
        SemesterCalendar entry = semesterCalendarService.create(
            req.get("title").toString(),
            req.getOrDefault("description", "").toString(),
            LocalDate.parse(req.get("date").toString()),
            req.getOrDefault("type", "EVENT").toString()
        );
        return ResponseEntity.ok(toMap(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        semesterCalendarService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private Map<String, Object> toMap(SemesterCalendar s) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", s.getId());
        map.put("title", s.getTitle());
        map.put("description", s.getDescription());
        map.put("date", s.getDate());
        map.put("type", s.getType());
        return map;
    }
}
