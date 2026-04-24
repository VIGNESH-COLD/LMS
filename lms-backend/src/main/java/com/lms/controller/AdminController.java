package com.lms.controller;

import com.lms.dto.RegisterRequest;
import com.lms.model.*;
import com.lms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers().stream().map(this::userToMap).toList());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody RegisterRequest request) {
        User user = adminService.createUser(request);
        return ResponseEntity.ok(userToMap(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody RegisterRequest request) {
        User user = adminService.updateUser(id, request);
        return ResponseEntity.ok(userToMap(user));
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(adminService.getUsersByRole(Role.valueOf(role)).stream().map(this::userToMap).toList());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> req) {
        User user = adminService.updateUserRole(id, Role.valueOf(req.get("role")));
        return ResponseEntity.ok(userToMap(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PostMapping("/allocate")
    public ResponseEntity<?> allocateCourse(@RequestBody Map<String, Long> req) {
        adminService.allocateCourseToInstructor(req.get("courseId"), req.get("instructorId"));
        return ResponseEntity.ok(Map.of("message", "Course allocated"));
    }

    @SuppressWarnings("unchecked")
    @PostMapping("/enroll-bulk")
    public ResponseEntity<?> enrollBulk(@RequestBody Map<String, Object> req) {
        Long courseId = Long.valueOf(req.get("courseId").toString());
        List<Integer> studentIds = (List<Integer>) req.get("studentIds");
        adminService.bulkEnrollStudents(courseId, studentIds.stream().map(Integer::longValue).toList());
        return ResponseEntity.ok(Map.of("message", "Students enrolled successfully"));
    }


    @PutMapping("/assignments/{id}/deadline")
    public ResponseEntity<?> extendDeadline(@PathVariable Long id, @RequestBody Map<String, String> req) {
        adminService.extendDeadline(id, LocalDateTime.parse(req.get("deadline")));
        return ResponseEntity.ok(Map.of("message", "Deadline extended"));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    private Map<String, Object> userToMap(User u) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("email", u.getEmail());
        map.put("role", u.getRole().toString());
        map.put("department", u.getDepartment());
        map.put("section", u.getSection());
        map.put("rollNumber", u.getRollNumber());
        map.put("year", u.getYear());
        map.put("semester", u.getSemester());
        map.put("phoneNumber", u.getPhoneNumber());
        map.put("createdAt", u.getCreatedAt());
        return map;
    }
}
