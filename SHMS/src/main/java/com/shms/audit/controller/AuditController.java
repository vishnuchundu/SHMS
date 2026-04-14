package com.shms.audit.controller;

import com.shms.audit.entity.AuditLog;
import com.shms.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Sort;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping("/logs")
    @PreAuthorize("hasAuthority('ROLE_CHAIRMAN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AuditLog>> getSystemAuditLogs() {
        // Fetch all traces sorted descending by timestamp securely tracking execution boundaries natively
        List<AuditLog> auditLogs = auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(auditLogs);
    }
}
