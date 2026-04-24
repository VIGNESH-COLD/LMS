package com.lms.repository;

import com.lms.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudentId(Long studentId);
    List<Submission> findByQuizId(Long quizId);
    List<Submission> findByAssignmentId(Long assignmentId);
    Optional<Submission> findByStudentIdAndQuizId(Long studentId, Long quizId);
    Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
    List<Submission> findByStudentIdAndQuizIsNotNull(Long studentId);
    List<Submission> findByStudentIdAndAssignmentIsNotNull(Long studentId);
}
