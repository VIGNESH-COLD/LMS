package com.lms.repository;

import com.lms.model.SyllabusItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SyllabusItemRepository extends JpaRepository<SyllabusItem, Long> {
    List<SyllabusItem> findByCourseIdOrderByOrderIndexAsc(Long courseId);
    long countByCourseIdAndCompletedTrue(Long courseId);
    long countByCourseId(Long courseId);
}
