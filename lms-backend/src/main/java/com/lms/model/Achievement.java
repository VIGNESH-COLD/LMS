package com.lms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;

    private String badge;

    // Student-submitted achievement fields
    private String awardType;       // e.g. Academic, Sports, Cultural, Technical
    private String academicLevel;   // e.g. International, National, State, Regional
    private String awardedBy;       // Organization that awarded
    private String certificateFileName; // stored file name for certificate
    private String academicYear;    // e.g. 2025-2026
    private String eventDate;       // date of the award

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(nullable = false)
    @Builder.Default
    private boolean submittedByStudent = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    private LocalDateTime awardedAt;

    @PrePersist
    protected void onCreate() {
        this.awardedAt = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
    }
}
