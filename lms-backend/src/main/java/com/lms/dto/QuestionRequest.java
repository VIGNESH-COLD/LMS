package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String text;

    @NotBlank(message = "Question type is required")
    private String type;

    private List<String> options;
    private String correctAnswer;

    @NotNull(message = "Marks is required")
    private Integer marks;
}
