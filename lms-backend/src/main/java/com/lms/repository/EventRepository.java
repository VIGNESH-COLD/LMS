package com.lms.repository;

import com.lms.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByEventDateAsc();
    List<Event> findByEventDateAfterOrderByEventDateAsc(LocalDateTime date);
    List<Event> findByType(String type);
}
