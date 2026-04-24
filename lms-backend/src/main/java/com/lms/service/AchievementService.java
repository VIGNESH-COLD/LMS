package com.lms.service;

import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public List<Achievement> getByStudent(Long studentId) {
        return achievementRepository.findByStudentIdOrderByAwardedAtDesc(studentId);
    }

    public List<Achievement> getAllSubmissions() {
        return achievementRepository.findBySubmittedByStudentTrueOrderByAwardedAtDesc();
    }

    public Achievement create(String title, String description, String icon, String badge, Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Achievement achievement = Achievement.builder()
                .title(title)
                .description(description)
                .icon(icon)
                .badge(badge)
                .student(student)
                .submittedByStudent(false)
                .status("APPROVED")
                .build();
        if (courseId != null) {
            Course course = courseRepository.findById(courseId).orElse(null);
            achievement.setCourse(course);
        }
        return achievementRepository.save(achievement);
    }

    public Achievement submitByStudent(Long studentId, String title, String description,
                                       String awardType, String academicLevel, String awardedBy,
                                       String certificateFileName, String academicYear, String eventDate) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Achievement achievement = Achievement.builder()
                .title(title)
                .description(description)
                .awardType(awardType)
                .academicLevel(academicLevel)
                .awardedBy(awardedBy)
                .certificateFileName(certificateFileName)
                .academicYear(academicYear)
                .eventDate(eventDate)
                .icon("🏆")
                .badge("GOLD")
                .student(student)
                .submittedByStudent(true)
                .status("PENDING")
                .build();
        return achievementRepository.save(achievement);
    }

    public Achievement updateStatus(Long id, String status) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));
        achievement.setStatus(status);
        return achievementRepository.save(achievement);
    }

    public void delete(Long id) {
        achievementRepository.deleteById(id);
    }
}
