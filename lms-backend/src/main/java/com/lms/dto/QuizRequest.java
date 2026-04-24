package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuizRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private Integer totalMarks;
    private Integer durationMinutes;
    private LocalDateTime deadline;
    private String externalUrl;
    private List<QuestionRequest> questions;
}
