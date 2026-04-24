package com.lms.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "academic_classes") // e.g. II CSE, III IT
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AcademicClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    private Integer batchYear; // e.g., 2025
    private Integer collegeYear; // e.g., 2 (2nd year)
    private Integer semester; // e.g., 4

    @JsonIgnore
    @OneToMany(mappedBy = "academicClass", cascade = CascadeType.ALL)
    private List<Section> sections;
}
