package com.lms.service;

import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SemesterCalendarService {

    private final SemesterCalendarRepository semesterCalendarRepository;

    public List<SemesterCalendar> getAll() {
        return semesterCalendarRepository.findAllByOrderByDateAsc();
    }

    public List<SemesterCalendar> getUpcoming() {
        return semesterCalendarRepository.findByDateAfterOrderByDateAsc(LocalDate.now());
    }

    public SemesterCalendar create(String title, String description, LocalDate date, String type) {
        SemesterCalendar entry = SemesterCalendar.builder()
                .title(title)
                .description(description)
                .date(date)
                .type(type)
                .build();
        return semesterCalendarRepository.save(entry);
    }

    public void delete(Long id) {
        semesterCalendarRepository.deleteById(id);
    }
}
