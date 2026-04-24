package com.lms.dto;

import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuizSubmissionRequest {
    private Long quizId;
    /** Map of questionId -> student's answer */
    private Map<Long, String> answers;
}
