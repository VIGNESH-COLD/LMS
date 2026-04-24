package com.lms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    /** JSON answers for quiz or file path for assignment */
    @Column(columnDefinition = "TEXT")
    private String content;

    private String filePath;

    private Integer score;

    private Integer totalMarks;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Boolean graded;

    private LocalDateTime submittedAt;

    private LocalDateTime gradedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
        this.graded = false;
    }
}
