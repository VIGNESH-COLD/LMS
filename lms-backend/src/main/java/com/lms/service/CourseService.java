package com.lms.service;

import com.lms.dto.*;
import com.lms.model.*;
import com.lms.model.Module;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseResponse createCourse(CourseRequest request, Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnail(request.getThumbnail())
                .instructor(instructor)
                .build();

        course = courseRepository.save(course);
        return toCourseResponse(course);
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toCourseResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return toCourseResponseWithModules(course);
    }

    public List<CourseResponse> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId).stream()
                .map(this::toCourseResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse updateCourse(Long id, CourseRequest request, Long instructorId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to update this course");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        if (request.getThumbnail() != null) course.setThumbnail(request.getThumbnail());

        course = courseRepository.save(course);
        return toCourseResponse(course);
    }

    public void deleteCourse(Long id, Long instructorId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to delete this course");
        }
        courseRepository.delete(course);
    }

    // Module CRUD
    public ModuleResponse addModule(Long courseId, ModuleRequest request, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized");
        }

        Module module = Module.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
                .course(course)
                .build();

        module = moduleRepository.save(module);
        return toModuleResponse(module);
    }

    public List<ModuleResponse> getModulesByCourse(Long courseId) {
        return moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId).stream()
                .map(this::toModuleResponse)
                .collect(Collectors.toList());
    }

    public void deleteModule(Long moduleId, Long instructorId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        if (!module.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized");
        }
        moduleRepository.delete(module);
    }

    // Material management
    public MaterialResponse addMaterial(Long moduleId, String title, MaterialType type,
                                         String url, String fileName, Long fileSize, Long instructorId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        if (!module.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized");
        }

        Material material = Material.builder()
                .title(title)
                .type(type)
                .url(url)
                .fileName(fileName)
                .fileSize(fileSize)
                .module(module)
                .build();

        material = materialRepository.save(material);
        return toMaterialResponse(material);
    }

    // Search
    public List<CourseResponse> searchCourses(String keyword) {
        return courseRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(this::toCourseResponse)
                .collect(Collectors.toList());
    }

    // Mappers
    private CourseResponse toCourseResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnail(course.getThumbnail())
                .instructorName(course.getInstructor().getName())
                .instructorId(course.getInstructor().getId())
                .createdAt(course.getCreatedAt())
                .moduleCount(course.getModules() != null ? course.getModules().size() : 0)
                .studentCount((int) enrollmentRepository.countByCourseId(course.getId()))
                .build();
    }

    private CourseResponse toCourseResponseWithModules(Course course) {
        CourseResponse response = toCourseResponse(course);
        if (course.getModules() != null) {
            response.setModules(course.getModules().stream()
                    .map(this::toModuleResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    private ModuleResponse toModuleResponse(Module module) {
        return ModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .orderIndex(module.getOrderIndex())
                .materials(module.getMaterials() != null ?
                        module.getMaterials().stream()
                                .map(this::toMaterialResponse)
                                .collect(Collectors.toList()) : List.of())
                .build();
    }

    private MaterialResponse toMaterialResponse(Material material) {
        return MaterialResponse.builder()
                .id(material.getId())
                .title(material.getTitle())
                .type(material.getType().name())
                .url(material.getUrl())
                .fileName(material.getFileName())
                .fileSize(material.getFileSize())
                .build();
    }
}
