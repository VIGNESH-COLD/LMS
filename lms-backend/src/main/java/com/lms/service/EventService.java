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
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public List<Event> getAll() {
        return eventRepository.findAllByOrderByEventDateAsc();
    }

    public List<Event> getUpcoming() {
        return eventRepository.findByEventDateAfterOrderByEventDateAsc(LocalDateTime.now());
    }

    public Event create(String title, String description, LocalDateTime eventDate, String location, String type, Long createdById) {
        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Event event = Event.builder()
                .title(title)
                .description(description)
                .eventDate(eventDate)
                .location(location)
                .type(type)
                .createdBy(creator)
                .build();
        return eventRepository.save(event);
    }

    public void delete(Long id) {
        eventRepository.deleteById(id);
    }
}
