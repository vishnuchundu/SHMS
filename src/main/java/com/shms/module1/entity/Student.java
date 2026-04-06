package com.shms.module1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "students")
public class Student {

    @Id
    private String id;
    
    private String userId; // Manual Reference to core User for authentication logic
    
    private String studentName;
    
    private String photoFilePath; // simulated photo storage path
    
    private DuesStatus duesStatus;
    
    private String roomId; // Manual Reference to Room
    
    private Double roomRentDue;
    
    private Double messDue;
    
    private Double amenitiesDue;
}
