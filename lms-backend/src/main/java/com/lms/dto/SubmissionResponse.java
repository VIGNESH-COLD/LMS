package com.lms.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long quizId;
    private String quizTitle;
    private Long assignmentId;
    private String assignmentTitle;
    private String content;
    private String filePath;
    private Integer score;
    private Integer totalMarks;
    private String feedback;
    private Boolean graded;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;
}
