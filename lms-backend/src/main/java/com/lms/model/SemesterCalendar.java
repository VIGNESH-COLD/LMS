package com.lms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "semester_calendar")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SemesterCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDate date;

    private String type; // EXAM, HOLIDAY, DEADLINE, EVENT, SEMESTER_START, SEMESTER_END

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
