package com.lms.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ModuleResponse {
    private Long id;
    private String title;
    private String description;
    private Integer orderIndex;
    private List<MaterialResponse> materials;
}
