package com.lms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "timetables")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String dayOfWeek; // MONDAY, TUESDAY, etc.

    @Column(nullable = false)
    private String startTime; // "09:00"

    @Column(nullable = false)
    private String endTime; // "10:00"

    private String room;

    private String building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;
}
