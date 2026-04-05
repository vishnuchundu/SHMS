package com.shms.module4.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leave_records")
public class LeaveRecord {

    @Id
    private String id;
    
    private String staffId;
    
    private LocalDate absenceDate;
    
    private String reason;
    
    private String loggedByUserId; // Maps specifically to the Hall Clerk's user ID for Audit Trail
}
