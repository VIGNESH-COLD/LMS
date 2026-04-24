package com.lms.controller;

import com.lms.config.JwtUtil;
import com.lms.dto.*;
import com.lms.model.MaterialType;
import com.lms.service.CourseService;
import com.lms.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final JwtUtil jwtUtil;

    private Long getUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CourseResponse>> searchCourses(@RequestParam String keyword) {
        return ResponseEntity.ok(courseService.searchCourses(keyword));
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<CourseResponse>> getInstructorCourses(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(courseService.getCoursesByInstructor(getUserId(authHeader)));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseResponse> createCourse(
            @Valid @RequestBody CourseRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(courseService.createCourse(request, getUserId(authHeader)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(courseService.updateCourse(id, request, getUserId(authHeader)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        courseService.deleteCourse(id, getUserId(authHeader));
        return ResponseEntity.noContent().build();
    }

    // Module endpoints
    @PostMapping("/{courseId}/modules")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<ModuleResponse> addModule(
            @PathVariable Long courseId,
            @Valid @RequestBody ModuleRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(courseService.addModule(courseId, request, getUserId(authHeader)));
    }

    @GetMapping("/{courseId}/modules")
    public ResponseEntity<List<ModuleResponse>> getModules(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getModulesByCourse(courseId));
    }

    @DeleteMapping("/modules/{moduleId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteModule(
            @PathVariable Long moduleId,
            @RequestHeader("Authorization") String authHeader) {
        courseService.deleteModule(moduleId, getUserId(authHeader));
        return ResponseEntity.noContent().build();
    }

    // Material endpoints
    @PostMapping("/modules/{moduleId}/materials")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<MaterialResponse> addMaterial(
            @PathVariable Long moduleId,
            @RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String authHeader) {
        String title = (String) body.get("title");
        MaterialType type = MaterialType.valueOf(((String) body.get("type")).toUpperCase());
        String url = (String) body.get("url");
        String fileName = (String) body.getOrDefault("fileName", null);
        Long fileSize = body.get("fileSize") != null ? Long.parseLong(body.get("fileSize").toString()) : null;

        return ResponseEntity.ok(courseService.addMaterial(moduleId, title, type, url, fileName, fileSize, getUserId(authHeader)));
    }

    // Enrollment endpoints
    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> enroll(
            @PathVariable Long courseId,
            @RequestHeader("Authorization") String authHeader) {
        enrollmentService.enroll(getUserId(authHeader), courseId);
        return ResponseEntity.ok(Map.of("message", "Enrolled successfully"));
    }

    @DeleteMapping("/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> unenroll(
            @PathVariable Long courseId,
            @RequestHeader("Authorization") String authHeader) {
        enrollmentService.unenroll(getUserId(authHeader), courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{courseId}/enrolled")
    public ResponseEntity<Map<String, Boolean>> checkEnrollment(
            @PathVariable Long courseId,
            @RequestHeader("Authorization") String authHeader) {
        boolean enrolled = enrollmentService.isEnrolled(getUserId(authHeader), courseId);
        return ResponseEntity.ok(Map.of("enrolled", enrolled));
    }

    @GetMapping("/enrolled")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseResponse>> getEnrolledCourses(
            @RequestHeader("Authorization") String authHeader) {
        Long studentId = getUserId(authHeader);
        var enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        List<CourseResponse> courses = enrollments.stream()
                .map(e -> courseService.getCourseById(e.getCourse().getId()))
                .toList();
        return ResponseEntity.ok(courses);
    }
}
