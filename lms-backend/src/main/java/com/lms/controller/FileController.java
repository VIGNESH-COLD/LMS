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
            String contentType = "application/octet-stream";
            if (fileName.endsWith(".pdf")) contentType = "application/pdf";
            else if (fileName.endsWith(".png")) contentType = "image/png";
            else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
