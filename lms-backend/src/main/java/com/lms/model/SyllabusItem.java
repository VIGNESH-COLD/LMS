package com.lms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SyllabusItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String topic;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Boolean completed;

    private LocalDateTime completedDate;

    private Integer orderIndex;

    @PrePersist
    protected void onCreate() {
        if (this.completed == null) this.completed = false;
    }
}
