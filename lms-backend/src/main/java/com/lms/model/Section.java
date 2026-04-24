package com.lms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sections")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = false)
    private AcademicClass academicClass;

    @Column(nullable = false)
    private String name; // A, B, C...
}
