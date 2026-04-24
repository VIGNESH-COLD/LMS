package com.lms.service;

import com.lms.dto.AnalyticsResponse;
import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    public AnalyticsResponse getInstructorAnalytics(Long instructorId) {
        List<Course> courses = courseRepository.findByInstructorId(instructorId);

        int totalStudents = 0;
        int totalQuizzes = 0;
        int totalAssignments = 0;

        List<AnalyticsResponse.CourseAnalytics> courseAnalytics = courses.stream()
                .map(course -> {
                    int enrolled = (int) enrollmentRepository.countByCourseId(course.getId());
                    List<Quiz> quizzes = quizRepository.findByCourseId(course.getId());
                    List<Assignment> assignments = assignmentRepository.findByCourseId(course.getId());

                    double avgQuizScore = 0;
                    int totalSubmissions = 0;
                    double totalScores = 0;

                    for (Quiz quiz : quizzes) {
                        List<Submission> submissions = submissionRepository.findByQuizId(quiz.getId());
                        for (Submission s : submissions) {
                            if (s.getGraded() != null && s.getGraded() && s.getScore() != null && s.getTotalMarks() != null && s.getTotalMarks() > 0) {
                                totalScores += (double) s.getScore() / s.getTotalMarks() * 100;
                                totalSubmissions++;
                            }
                        }
                    }

                    if (totalSubmissions > 0) {
                        avgQuizScore = totalScores / totalSubmissions;
                    }

                    return AnalyticsResponse.CourseAnalytics.builder()
                            .courseId(course.getId())
                            .courseTitle(course.getTitle())
                            .enrolledStudents(enrolled)
                            .quizCount(quizzes.size())
                            .assignmentCount(assignments.size())
                            .averageQuizScore(Math.round(avgQuizScore * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());

        for (var ca : courseAnalytics) {
            totalStudents += ca.getEnrolledStudents();
            totalQuizzes += ca.getQuizCount();
            totalAssignments += ca.getAssignmentCount();
        }

        double overallAvg = courseAnalytics.stream()
                .mapToDouble(AnalyticsResponse.CourseAnalytics::getAverageQuizScore)
                .average()
                .orElse(0);

        return AnalyticsResponse.builder()
                .totalCourses(courses.size())
                .totalStudents(totalStudents)
                .totalQuizzes(totalQuizzes)
                .totalAssignments(totalAssignments)
                .averageScore(Math.round(overallAvg * 100.0) / 100.0)
                .courseAnalytics(courseAnalytics)
                .build();
    }

    public AnalyticsResponse getStudentAnalytics(Long studentId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);

        List<Submission> quizSubmissions = submissionRepository.findByStudentIdAndQuizIsNotNull(studentId);
        List<Submission> assignmentSubmissions = submissionRepository.findByStudentIdAndAssignmentIsNotNull(studentId);

        double totalScorePercentage = 0;
        int gradedCount = 0;

        for (Submission s : quizSubmissions) {
            if (s.getGraded() != null && s.getGraded() && s.getScore() != null && s.getTotalMarks() != null && s.getTotalMarks() > 0) {
                totalScorePercentage += (double) s.getScore() / s.getTotalMarks() * 100;
                gradedCount++;
            }
        }
        for (Submission s : assignmentSubmissions) {
            if (s.getGraded() != null && s.getGraded() && s.getScore() != null && s.getTotalMarks() != null && s.getTotalMarks() > 0) {
                totalScorePercentage += (double) s.getScore() / s.getTotalMarks() * 100;
                gradedCount++;
            }
        }

        double avgScore = gradedCount > 0 ? totalScorePercentage / gradedCount : 0;

        return AnalyticsResponse.builder()
                .totalCourses(enrollments.size())
                .totalQuizzes(quizSubmissions.size())
                .totalAssignments(assignmentSubmissions.size())
                .averageScore(Math.round(avgScore * 100.0) / 100.0)
                .build();
    }
}
