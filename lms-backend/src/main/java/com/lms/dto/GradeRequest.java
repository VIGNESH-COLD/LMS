package com.lms.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GradeRequest {
    private Integer score;
    private String feedback;
}
