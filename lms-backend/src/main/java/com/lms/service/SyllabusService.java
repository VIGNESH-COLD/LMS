package com.lms.service;

import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SyllabusService {

    private final SyllabusItemRepository syllabusItemRepository;
    private final CourseRepository courseRepository;

    public List<SyllabusItem> getByCourse(Long courseId) {
        return syllabusItemRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
    }

    public Map<String, Object> getProgress(Long courseId) {
        long total = syllabusItemRepository.countByCourseId(courseId);
        long completed = syllabusItemRepository.countByCourseIdAndCompletedTrue(courseId);
        Map<String, Object> progress = new HashMap<>();
        progress.put("total", total);
        progress.put("completed", completed);
        progress.put("percentage", total > 0 ? (completed * 100 / total) : 0);
        return progress;
    }

    public SyllabusItem create(Long courseId, String topic, String description, Integer orderIndex) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        SyllabusItem item = SyllabusItem.builder()
                .course(course)
                .topic(topic)
                .description(description)
                .orderIndex(orderIndex)
                .completed(false)
                .build();
        return syllabusItemRepository.save(item);
    }

    public SyllabusItem toggleComplete(Long id) {
        SyllabusItem item = syllabusItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Syllabus item not found"));
        item.setCompleted(!item.getCompleted());
        item.setCompletedDate(item.getCompleted() ? LocalDateTime.now() : null);
        return syllabusItemRepository.save(item);
    }

    public void delete(Long id) {
        syllabusItemRepository.deleteById(id);
    }
}
