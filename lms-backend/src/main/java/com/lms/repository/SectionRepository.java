package com.lms.repository;
import com.lms.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SectionRepository extends JpaRepository<Section, Long> {
    java.util.List<Section> findByAcademicClassId(Long classId);
}
