package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String thumbnail;
}
