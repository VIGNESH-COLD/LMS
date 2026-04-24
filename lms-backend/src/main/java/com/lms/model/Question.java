package com.lms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    /** JSON array of options for MCQ, e.g. ["Option A","Option B","Option C","Option D"] */
    @Column(columnDefinition = "TEXT")
    private String options;

    /** Correct answer text or option index */
    private String correctAnswer;

    @Column(nullable = false)
    private Integer marks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
}
