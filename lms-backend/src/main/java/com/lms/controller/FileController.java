package com.lms.controller;

import com.lms.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        try {
            String storedName = fileService.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                    "fileName", storedName,
                    "originalName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "",
                    "size", String.valueOf(file.getSize())
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/{fileName}")
    public ResponseEntity<byte[]> download(@PathVariable String fileName) {
        try {
            byte[] data = fileService.downloadFile(fileName);
            String lower = fileName.toLowerCase();
            String contentType = "application/octet-stream";
            String disposition = "attachment";

            if (lower.endsWith(".pdf")) {
                contentType = "application/pdf";
                disposition = "inline";
            } else if (lower.endsWith(".png")) {
                contentType = "image/png";
                disposition = "inline";
            } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                contentType = "image/jpeg";
                disposition = "inline";
            } else if (lower.endsWith(".gif")) {
                contentType = "image/gif";
                disposition = "inline";
            } else if (lower.endsWith(".webp")) {
                contentType = "image/webp";
                disposition = "inline";
            }

            String safeFileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("X-Content-Type-Options", "nosniff")
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + safeFileName + "\"")
                    .body(data);
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
