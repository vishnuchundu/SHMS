package com.shms.audit.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {
    
    @Id
    private String id;
    
    private String userId; // Can be null if system action or unauthorized
    
    private String method; // E.g., CREATE_USER, UPDATE_PAYMENT
    
    private String entityId; // The ID of the modified entity
    
    private String details; // Additional JSON or string details
    
    private LocalDateTime timestamp;
}
