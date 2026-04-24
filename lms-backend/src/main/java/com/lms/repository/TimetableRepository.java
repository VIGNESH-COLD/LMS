package com.lms.repository;

import com.lms.model.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByCourseId(Long courseId);
    List<Timetable> findByDayOfWeekOrderByStartTimeAsc(String dayOfWeek);
    List<Timetable> findAllByOrderByDayOfWeekAscStartTimeAsc();
}
