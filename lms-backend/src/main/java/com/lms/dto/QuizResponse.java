package com.lms.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private Long courseId;
    private String courseName;
    private Integer totalMarks;
    private Integer durationMinutes;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private List<QuestionResponse> questions;
    private String externalUrl;
    private boolean attempted;
}
