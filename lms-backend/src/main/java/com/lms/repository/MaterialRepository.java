package com.lms.repository;

import com.lms.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByModuleId(Long moduleId);
}
