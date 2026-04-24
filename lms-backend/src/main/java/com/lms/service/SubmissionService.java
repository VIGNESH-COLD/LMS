package com.lms.service;

import com.lms.dto.*;
import com.lms.model.*;
import com.lms.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * Submit a quiz — auto-grade MCQ questions
     */
    public SubmissionResponse submitQuiz(QuizSubmissionRequest request, Long studentId) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (submissionRepository.findByStudentIdAndQuizId(studentId, quiz.getId()).isPresent()) {
            throw new RuntimeException("Quiz already attempted");
        }

        // Server-side deadline enforcement
        if (quiz.getDeadline() != null && LocalDateTime.now().isAfter(quiz.getDeadline())) {
            throw new RuntimeException("Quiz deadline has passed. Submissions are no longer accepted.");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        Map<Long, String> answers = request.getAnswers();

        int totalScore = 0;
        int totalMarks = 0;

        for (Question q : questions) {
            totalMarks += q.getMarks();
            if (q.getType() == QuestionType.MCQ && answers.containsKey(q.getId())) {
                String studentAnswer = answers.get(q.getId()).trim();
                if (studentAnswer.equalsIgnoreCase(q.getCorrectAnswer())) {
                    totalScore += q.getMarks();
                }
            }
            // Descriptive questions need manual grading
        }

        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            answersJson = answers.toString();
        }

        boolean allMcq = questions.stream().allMatch(q -> q.getType() == QuestionType.MCQ);

        Submission submission = Submission.builder()
                .student(student)
                .quiz(quiz)
                .content(answersJson)
                .score(totalScore)
                .totalMarks(totalMarks)
                .graded(allMcq)
                .gradedAt(allMcq ? LocalDateTime.now() : null)
                .build();

        submission = submissionRepository.save(submission);
        return toResponse(submission);
    }

    /**
     * Submit an assignment (text content or file)
     */
    public SubmissionResponse submitAssignment(Long assignmentId, String content, String filePath, Long studentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (submissionRepository.findByStudentIdAndAssignmentId(studentId, assignmentId).isPresent()) {
            throw new RuntimeException("Assignment already submitted");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Submission submission = Submission.builder()
                .student(student)
                .assignment(assignment)
                .content(content)
                .filePath(filePath)
                .totalMarks(assignment.getTotalMarks())
                .graded(false)
                .build();

        submission = submissionRepository.save(submission);
        return toResponse(submission);
    }

    /**
     * Instructor grades a submission
     */
    public SubmissionResponse gradeSubmission(Long submissionId, GradeRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setScore(request.getScore());
        submission.setFeedback(request.getFeedback());
        submission.setGraded(true);
        submission.setGradedAt(LocalDateTime.now());

        submission = submissionRepository.save(submission);
        return toResponse(submission);
    }

    public List<SubmissionResponse> getSubmissionsByStudent(Long studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SubmissionResponse> getSubmissionsByQuiz(Long quizId) {
        return submissionRepository.findByQuizId(quizId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private SubmissionResponse toResponse(Submission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getName())
                .quizId(s.getQuiz() != null ? s.getQuiz().getId() : null)
                .quizTitle(s.getQuiz() != null ? s.getQuiz().getTitle() : null)
                .assignmentId(s.getAssignment() != null ? s.getAssignment().getId() : null)
                .assignmentTitle(s.getAssignment() != null ? s.getAssignment().getTitle() : null)
                .content(s.getContent())
                .filePath(s.getFilePath())
                .score(s.getScore())
                .totalMarks(s.getTotalMarks())
                .feedback(s.getFeedback())
                .graded(s.getGraded())
                .submittedAt(s.getSubmittedAt())
                .gradedAt(s.getGradedAt())
                .build();
    }
}
