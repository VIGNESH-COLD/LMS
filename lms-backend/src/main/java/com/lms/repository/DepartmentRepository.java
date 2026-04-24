package com.lms.repository;
import com.lms.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DepartmentRepository extends JpaRepository<Department, Long> {}
