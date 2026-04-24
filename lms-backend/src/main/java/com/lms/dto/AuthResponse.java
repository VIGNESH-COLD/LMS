package com.lms.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String department;
    private String section;
    private String rollNumber;
    private Integer year;
    private Integer semester;
    private String phoneNumber;
}
