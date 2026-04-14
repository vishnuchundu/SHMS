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
@Document(collection = "grants")
public class Grant {

    @Id
    private String id;
    
    private String hallId; // Maps funding explicitly isolating it to specific jurisdictions
    
    private String grantName; // E.g., "State Infrastructure Funding"
    
    private Double allocatedAmount; // The root pool size granted by the Admins
    
    private Double remainingBalance; // Strictly mutated algorithm bounding future expenditures natively
    
    private LocalDateTime createdTimestamp;
}
