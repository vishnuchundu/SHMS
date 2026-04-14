package com.shms.module4.entity;

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
@Document(collection = "payrolls")
public class Payroll {

    @Id
    private String id;
    
    private String staffId;
    
    // Explicit month tracker formatted as "YYYY-MM" (e.g. "2026-03")
    private String monthKey;
    
    private int totalWorkingDays;
    
    private int leaveDaysTaken;
    
    private Double netCalculatedSalary;
    
    private LocalDateTime generatedAt;
}
