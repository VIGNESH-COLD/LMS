package com.lms.repository;

import com.lms.model.InternalMark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternalMarkRepository extends JpaRepository<InternalMark, Long> {
    List<InternalMark> findByStudentId(Long studentId);
    List<InternalMark> findByCourseId(Long courseId);
    List<InternalMark> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
