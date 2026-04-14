package com.shms.module3.entity;

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
@Document(collection = "complaints")
public class Complaint {

    @Id
    private String id;
    
    private String studentId; // User who lodged the complaint
    
    private String hallId; // Target explicitly identifying which Warden owns the ticket
    
    private String title;
    
    private String description;
    
    private ComplaintStatus status;
    
    private String atrDetails; // Action Taken Report string payload (mandate > 0 len if CLOSED)
    
    private LocalDateTime timestamp;
    
    private LocalDateTime resolvedTimestamp;
}
