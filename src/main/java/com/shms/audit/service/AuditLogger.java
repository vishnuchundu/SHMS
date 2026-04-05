package com.shms.audit.service;

import com.shms.audit.entity.AuditLog;
import com.shms.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogger {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void logOperation(String userId, String method, String entityId, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .method(method)
                    .entityId(entityId)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved asynchronously -> User: {}, Method: {}, EntityID: {}", userId, method, entityId);
        } catch (Exception e) {
            log.error("Failed to save audit log. Method: {}, EntityID: {}", method, entityId, e);
        }
    }
}
