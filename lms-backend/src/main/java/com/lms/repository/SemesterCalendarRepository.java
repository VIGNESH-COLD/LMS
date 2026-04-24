package com.lms.repository;

import com.lms.model.SemesterCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SemesterCalendarRepository extends JpaRepository<SemesterCalendar, Long> {
    List<SemesterCalendar> findAllByOrderByDateAsc();
    List<SemesterCalendar> findByDateAfterOrderByDateAsc(LocalDate date);
    List<SemesterCalendar> findByType(String type);
}
