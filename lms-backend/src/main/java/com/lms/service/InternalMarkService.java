package com.lms.service;

import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class InternalMarkService {

    private final InternalMarkRepository internalMarkRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public List<InternalMark> getByStudent(Long studentId) {
        return internalMarkRepository.findByStudentId(studentId);
    }

    public List<InternalMark> getByCourse(Long courseId) {
        return internalMarkRepository.findByCourseId(courseId);
    }

    public InternalMark uploadMark(Long studentId, Long courseId, Integer exam1, Integer exam2, Integer exam3, Integer attendance) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<InternalMark> existing = internalMarkRepository.findByStudentIdAndCourseId(studentId, courseId);
        InternalMark mark;
        if (!existing.isEmpty()) {
            mark = existing.get(0);
        } else {
            mark = new InternalMark();
            mark.setStudent(student);
            mark.setCourse(course);
        }
        mark.setExam1(exam1);
        mark.setExam2(exam2);
        mark.setExam3(exam3);
        mark.setAttendance(attendance);
        int total = (exam1 != null ? exam1 : 0) + (exam2 != null ? exam2 : 0) + (exam3 != null ? exam3 : 0) + (attendance != null ? attendance : 0);
        mark.setTotal(total);
        return internalMarkRepository.save(mark);
    }

    public void delete(Long id) {
        internalMarkRepository.deleteById(id);
    }
}
