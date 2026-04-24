package com.lms.repository;

import com.lms.model.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findByCourseIdOrderByUploadedAtDesc(Long courseId);
    List<CourseMaterial> findByUploadedByIdOrderByUploadedAtDesc(Long userId);
}
