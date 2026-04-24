package com.lms.service;

import com.lms.model.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public List<Announcement> getAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Announcement> getForRole(String role) {
        return announcementRepository.findByTargetRoleOrTargetRoleOrderByCreatedAtDesc(role, "ALL");
    }

    public Announcement create(String title, String content, String priority, String targetRole, Long createdById) {
        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Announcement announcement = Announcement.builder()
                .title(title)
                .content(content)
                .priority(priority)
                .targetRole(targetRole)
                .createdBy(creator)
                .build();
        return announcementRepository.save(announcement);
    }

    public void delete(Long id) {
        announcementRepository.deleteById(id);
    }
}
