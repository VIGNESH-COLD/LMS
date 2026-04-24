package com.lms.controller;

import com.lms.model.Timetable;
import com.lms.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(timetableService.getAll().stream().map(this::toMap).toList());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(timetableService.getByCourse(courseId).stream().map(this::toMap).toList());
    }

    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<?> getByDay(@PathVariable String dayOfWeek) {
        return ResponseEntity.ok(timetableService.getByDay(dayOfWeek).stream().map(this::toMap).toList());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTimetables(java.security.Principal principal) {
        java.util.List<Timetable> list = timetableService.getMyTimetable(principal.getName());
        return ResponseEntity.ok(list.stream().map(this::toMap).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> req) {
        Long courseId = Long.valueOf(req.get("courseId").toString());
        Long sectionId = req.containsKey("sectionId") ? Long.valueOf(req.get("sectionId").toString()) : null;
        Timetable t = timetableService.create(
            courseId,
            req.get("dayOfWeek").toString(),
            req.get("startTime").toString(),
            req.get("endTime").toString(),
            req.getOrDefault("room", "").toString(),
            req.getOrDefault("building", "").toString(),
            sectionId
        );
        return ResponseEntity.ok(toMap(t));
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<?> getBySection(@PathVariable Long sectionId) {
        return ResponseEntity.ok(timetableService.getBySection(sectionId).stream().map(this::toMap).toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        timetableService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private Map<String, Object> toMap(Timetable t) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", t.getId());
        map.put("courseId", t.getCourse().getId());
        map.put("courseTitle", t.getCourse().getTitle());
        map.put("dayOfWeek", t.getDayOfWeek());
        map.put("startTime", t.getStartTime());
        map.put("endTime", t.getEndTime());
        map.put("room", t.getRoom());
        map.put("building", t.getBuilding());
        if (t.getSection() != null) {
            map.put("sectionId", t.getSection().getId());
            map.put("sectionName", t.getSection().getName());
        }
        return map;
    }
}
