package com.lms.controller;

import com.lms.config.JwtUtil;
import com.lms.model.InternalMark;
import com.lms.service.InternalMarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/internal-marks")
@RequiredArgsConstructor
public class InternalMarkController {

    private final InternalMarkService internalMarkService;
    private final JwtUtil jwtUtil;

    @GetMapping("/student")
    public ResponseEntity<?> getMyMarks(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.extractUserId(token.replace("Bearer ", ""));
        List<InternalMark> marks = internalMarkService.getByStudent(userId);
        return ResponseEntity.ok(marks.stream().map(this::toMap).toList());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getByCourse(@PathVariable Long courseId) {
        List<InternalMark> marks = internalMarkService.getByCourse(courseId);
        return ResponseEntity.ok(marks.stream().map(this::toMap).toList());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestBody Map<String, Object> request) {
        Long studentId = Long.valueOf(request.get("studentId").toString());
        Long courseId = Long.valueOf(request.get("courseId").toString());
        Integer exam1 = request.get("exam1") != null ? Integer.valueOf(request.get("exam1").toString()) : null;
        Integer exam2 = request.get("exam2") != null ? Integer.valueOf(request.get("exam2").toString()) : null;
        Integer exam3 = request.get("exam3") != null ? Integer.valueOf(request.get("exam3").toString()) : null;
        Integer attendance = request.get("attendance") != null ? Integer.valueOf(request.get("attendance").toString()) : null;
        InternalMark mark = internalMarkService.uploadMark(studentId, courseId, exam1, exam2, exam3, attendance);
        return ResponseEntity.ok(toMap(mark));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        internalMarkService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    private Map<String, Object> toMap(InternalMark m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId());
        map.put("studentId", m.getStudent().getId());
        map.put("studentName", m.getStudent().getName());
        map.put("courseId", m.getCourse().getId());
        map.put("courseTitle", m.getCourse().getTitle());
        map.put("exam1", m.getExam1());
        map.put("exam2", m.getExam2());
        map.put("exam3", m.getExam3());
        map.put("attendance", m.getAttendance());
        map.put("total", m.getTotal());
        return map;
    }
}
