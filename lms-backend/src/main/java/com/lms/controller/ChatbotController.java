package com.lms.controller;

import com.lms.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChatRequest request) {
        
        String response = chatbotService.chat(userDetails.getUsername(), request.getMessage(), request.getHistory());
        return ResponseEntity.ok(Map.of("response", response));
    }

    public static class ChatRequest {
        private String message;
        private List<Map<String, String>> history;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public List<Map<String, String>> getHistory() {
            return history;
        }

        public void setHistory(List<Map<String, String>> history) {
            this.history = history;
        }
    }
}
