package com.lms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "materials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType type;

    @Column(nullable = false)
    private String url;

    private String fileName;

    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;
}
