package com.lms.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String thumbnail;
    private String instructorName;
    private Long instructorId;
    private LocalDateTime createdAt;
    private int moduleCount;
    private int studentCount;
    private List<ModuleResponse> modules;
}
