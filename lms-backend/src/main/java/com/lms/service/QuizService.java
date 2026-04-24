package com.lms.service;

import com.lms.dto.*;
import com.lms.model.*;
import com.lms.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final CourseRepository courseRepository;
    private final ObjectMapper objectMapper;

    public QuizResponse createQuiz(QuizRequest request, Long instructorId) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized to create quiz for this course");
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .course(course)
                .totalMarks(request.getTotalMarks())
                .durationMinutes(request.getDurationMinutes())
                .deadline(request.getDeadline())
                .externalUrl(request.getExternalUrl())
                .build();

        quiz = quizRepository.save(quiz);

        if (request.getQuestions() != null) {
            final Quiz savedQuiz = quiz;
            List<Question> questions = request.getQuestions().stream()
                    .map(q -> {
                        String optionsJson = null;
                        if (q.getOptions() != null) {
                            try {
                                optionsJson = objectMapper.writeValueAsString(q.getOptions());
                            } catch (JsonProcessingException e) {
                                throw new RuntimeException("Error serializing options");
                            }
                        }
                        return Question.builder()
                                .text(q.getText())
                                .type(QuestionType.valueOf(q.getType().toUpperCase()))
                                .options(optionsJson)
                                .correctAnswer(q.getCorrectAnswer())
                                .marks(q.getMarks())
                                .quiz(savedQuiz)
                                .build();
                    })
                    .collect(Collectors.toList());
            questionRepository.saveAll(questions);
            quiz.setQuestions(questions);
        }

        return toQuizResponse(quiz, false);
    }

    public List<QuizResponse> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId).stream()
                .map(q -> toQuizResponse(q, false))
                .collect(Collectors.toList());
    }

    public QuizResponse getQuizById(Long quizId, boolean includeAnswers) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        return toQuizResponse(quiz, includeAnswers);
    }

    public void deleteQuiz(Long quizId, Long instructorId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        if (!quiz.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized");
        }
        quizRepository.delete(quiz);
    }

    private QuizResponse toQuizResponse(Quiz quiz, boolean includeAnswers) {
        List<QuestionResponse> questionResponses = null;
        if (quiz.getQuestions() != null) {
            questionResponses = quiz.getQuestions().stream()
                    .map(q -> {
                        List<String> options = null;
                        if (q.getOptions() != null) {
                            try {
                                options = objectMapper.readValue(q.getOptions(), new TypeReference<List<String>>() {});
                            } catch (JsonProcessingException e) {
                                // ignore
                            }
                        }
                        return QuestionResponse.builder()
                                .id(q.getId())
                                .text(q.getText())
                                .type(q.getType().name())
                                .options(options)
                                .correctAnswer(includeAnswers ? q.getCorrectAnswer() : null)
                                .marks(q.getMarks())
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .courseId(quiz.getCourse().getId())
                .courseName(quiz.getCourse().getTitle())
                .totalMarks(quiz.getTotalMarks())
                .durationMinutes(quiz.getDurationMinutes())
                .deadline(quiz.getDeadline())
                .createdAt(quiz.getCreatedAt())
                .questions(questionResponses)
                .externalUrl(quiz.getExternalUrl())
                .build();
    }
}
