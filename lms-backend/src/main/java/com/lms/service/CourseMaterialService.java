package com.lms.service;

import com.lms.model.Course;
import com.lms.model.CourseMaterial;
import com.lms.model.User;
import com.lms.repository.CourseMaterialRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CourseMaterialService {

    private final CourseMaterialRepository materialRepo;
    private final CourseRepository courseRepo;
    private final UserRepository userRepo;
    private final FileService fileService;

    public CourseMaterial uploadMaterial(Long courseId, Long instructorId, String title, String description, MultipartFile file) throws IOException {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("You are not the instructor for this course");
        }

        User instructor = userRepo.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String storedName = fileService.uploadFile(file);
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
        String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase() : "unknown";

        CourseMaterial material = CourseMaterial.builder()
                .title(title)
                .description(description)
                .originalFileName(originalName)
                .storedFileName(storedName)
                .fileSize(file.getSize())
                .fileType(ext)
                .course(course)
                .uploadedBy(instructor)
                .build();

        return materialRepo.save(material);
    }

    public List<Map<String, Object>> getMaterialsByCourse(Long courseId) {
        return materialRepo.findByCourseIdOrderByUploadedAtDesc(courseId).stream()
                .map(this::toMap)
                .toList();
    }

    public List<Map<String, Object>> getMaterialsByInstructor(Long instructorId) {
        return materialRepo.findByUploadedByIdOrderByUploadedAtDesc(instructorId).stream()
                .map(this::toMap)
                .toList();
    }

    public void deleteMaterial(Long materialId, Long instructorId) throws IOException {
        CourseMaterial material = materialRepo.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        if (!material.getUploadedBy().getId().equals(instructorId)) {
            throw new RuntimeException("Not authorized to delete this material");
        }

        fileService.deleteFile(material.getStoredFileName());
        materialRepo.delete(material);
    }

    private Map<String, Object> toMap(CourseMaterial m) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", m.getId());
        map.put("title", m.getTitle());
        map.put("description", m.getDescription() != null ? m.getDescription() : "");
        map.put("originalFileName", m.getOriginalFileName());
        map.put("storedFileName", m.getStoredFileName());
        map.put("fileSize", m.getFileSize() != null ? m.getFileSize() : 0);
        map.put("fileType", m.getFileType() != null ? m.getFileType() : "");
        map.put("courseId", m.getCourse().getId());
        map.put("courseTitle", m.getCourse().getTitle());
        map.put("uploadedAt", m.getUploadedAt().toString());
        map.put("instructorName", m.getUploadedBy().getName());
        return map;
    }
}
