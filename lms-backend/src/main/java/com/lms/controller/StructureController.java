package com.lms.controller;

import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/structure")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class StructureController {
    
    private final DepartmentRepository departmentRepository;
    private final AcademicClassRepository classRepository;
    private final SectionRepository sectionRepository;

    @GetMapping("/departments")
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @PostMapping("/departments")
    public Department createDepartment(@RequestBody Department dept) {
        return departmentRepository.save(dept);
    }

    @DeleteMapping("/departments/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        departmentRepository.deleteById(id);
    }

    @GetMapping("/departments/{deptId}/classes")
    public List<AcademicClass> getClassesByDept(@PathVariable Long deptId) {
        return classRepository.findByDepartmentId(deptId);
    }

    @PostMapping("/departments/{deptId}/classes")
    public AcademicClass createClass(@PathVariable Long deptId, @RequestBody AcademicClass cls) {
        cls.setDepartment(departmentRepository.findById(deptId).orElseThrow());
        return classRepository.save(cls);
    }

    @DeleteMapping("/classes/{id}")
    public void deleteClass(@PathVariable Long id) {
        classRepository.deleteById(id);
    }

    @GetMapping("/classes/{classId}/sections")
    public List<Section> getSectionsByClass(@PathVariable Long classId) {
        return sectionRepository.findByAcademicClassId(classId);
    }

    @PostMapping("/classes/{classId}/sections")
    public Section createSection(@PathVariable Long classId, @RequestBody Section section) {
        section.setAcademicClass(classRepository.findById(classId).orElseThrow());
        return sectionRepository.save(section);
    }

    @DeleteMapping("/sections/{id}")
    public void deleteSection(@PathVariable Long id) {
        sectionRepository.deleteById(id);
    }
}
