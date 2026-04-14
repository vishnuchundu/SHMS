package com.shms.module5.entity;

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
@Document(collection = "expenses")
public class Expense {

    @Id
    private String id;
    
    private String grantId; // Link tracking directly back to the funding ledger source
    
    private String title;
    
    private String description;
    
    private Double deductedAmount;
    
    private String loggedByUserId; // Audit trail tracker isolating the exact Warden who logged this
    
    private LocalDateTime timestamp;
}
