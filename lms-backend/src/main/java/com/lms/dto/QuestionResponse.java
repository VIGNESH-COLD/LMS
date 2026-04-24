package com.lms.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionResponse {
    private Long id;
    private String text;
    private String type;
    private List<String> options;
    private String correctAnswer; // null for students during quiz
    private Integer marks;
}
