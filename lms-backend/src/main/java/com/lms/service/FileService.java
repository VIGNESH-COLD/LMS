package com.lms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String uploadFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String storedName = UUID.randomUUID().toString() + extension;

        Path targetPath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return storedName;
    }

    public byte[] downloadFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
        return Files.readAllBytes(filePath);
    }

    public void deleteFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
        Files.deleteIfExists(filePath);
    }
}
