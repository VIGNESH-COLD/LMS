package com.lms.service;

import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final UserRepository userRepository;

    public List<Timetable> getAll() {
        return timetableRepository.findAllByOrderByDayOfWeekAscStartTimeAsc();
    }

    public List<Timetable> getByCourse(Long courseId) {
        return timetableRepository.findByCourseId(courseId);
    }

    public List<Timetable> getBySection(Long sectionId) {
        return timetableRepository.findAll().stream()
                .filter(t -> t.getSection() != null && t.getSection().getId().equals(sectionId))
                .toList();
    }

    public List<Timetable> getMyTimetable(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return new ArrayList<>();

        if (user.getRole() == Role.INSTRUCTOR) {
            return timetableRepository.findAll().stream()
                    .filter(t -> t.getCourse() != null && t.getCourse().getInstructor() != null 
                              && t.getCourse().getInstructor().getId().equals(user.getId()))
                    .toList();
        } else if (user.getRole() == Role.STUDENT) {
            return timetableRepository.findAll().stream()
                    .filter(t -> t.getSection() != null 
                              && t.getSection().getName().equals(user.getSection())
                              && t.getSection().getAcademicClass() != null
                              && t.getSection().getAcademicClass().getSemester() != null
                              && t.getSection().getAcademicClass().getSemester().equals(user.getSemester())
                              && t.getSection().getAcademicClass().getDepartment() != null
                              && t.getSection().getAcademicClass().getDepartment().getName().equals(user.getDepartment()))
                    .toList();
        }
        return new ArrayList<>();
    }

    public List<Timetable> getByDay(String dayOfWeek) {
        return timetableRepository.findByDayOfWeekOrderByStartTimeAsc(dayOfWeek);
    }

    public Timetable create(Long courseId, String dayOfWeek, String startTime, String endTime, String room, String building, Long sectionId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Timetable timetable = Timetable.builder()
                .course(course)
                .dayOfWeek(dayOfWeek)
                .startTime(startTime)
                .endTime(endTime)
                .room(room)
                .building(building)
                .build();
                
        if (sectionId != null) {
            timetable.setSection(sectionRepository.findById(sectionId).orElse(null));
        }
                
        return timetableRepository.save(timetable);
    }

    public void delete(Long id) {
        timetableRepository.deleteById(id);
    }
}
