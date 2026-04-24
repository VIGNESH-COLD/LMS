package com.lms.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssignmentResponse {
    private Long id;
    private String title;
    private String description;
    private Long courseId;
    private String courseName;
    private Integer totalMarks;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private String filePath;
    private boolean submitted;
}
