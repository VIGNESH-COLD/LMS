package com.lms.repository;

import com.lms.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByStudentId(Long studentId);
    List<Achievement> findByStudentIdOrderByAwardedAtDesc(Long studentId);
    List<Achievement> findAllByOrderByAwardedAtDesc();
    List<Achievement> findBySubmittedByStudentTrueOrderByAwardedAtDesc();
}
