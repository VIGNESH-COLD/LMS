package com.lms.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsResponse {
    private int totalCourses;
    private int totalStudents;
    private int totalQuizzes;
    private int totalAssignments;
    private double averageScore;
    private List<CourseAnalytics> courseAnalytics;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CourseAnalytics {
        private Long courseId;
        private String courseTitle;
        private int enrolledStudents;
        private int quizCount;
        private int assignmentCount;
        private double averageQuizScore;
    }
}
