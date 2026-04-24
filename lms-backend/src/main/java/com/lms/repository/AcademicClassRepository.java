package com.lms.repository;
import com.lms.model.AcademicClass;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AcademicClassRepository extends JpaRepository<AcademicClass, Long> {
    java.util.List<AcademicClass> findByDepartmentId(Long departmentId);
}
