package com.lms.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaterialResponse {
    private Long id;
    private String title;
    private String type;
    private String url;
    private String fileName;
    private Long fileSize;
}
