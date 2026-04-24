package com.lms.controller;

import com.lms.model.Event;
import com.lms.service.EventService;
import com.lms.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(eventService.getAll().stream().map(this::toMap).toList());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcoming() {
        return ResponseEntity.ok(eventService.getUpcoming().stream().map(this::toMap).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> req, @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        Event event = eventService.create(
            req.get("title").toString(),
            req.getOrDefault("description", "").toString(),
            LocalDateTime.parse(req.get("eventDate").toString()),
            req.getOrDefault("location", "").toString(),
            req.getOrDefault("type", "EVENT").toString(),
            userId
        );
        return ResponseEntity.ok(toMap(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private Map<String, Object> toMap(Event e) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", e.getId());
        map.put("title", e.getTitle());
        map.put("description", e.getDescription());
        map.put("eventDate", e.getEventDate());
        map.put("location", e.getLocation());
        map.put("type", e.getType());
        map.put("createdBy", e.getCreatedBy() != null ? e.getCreatedBy().getName() : null);
        return map;
    }
}
