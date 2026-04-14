package com.shms.module4.entity;

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
@Document(collection = "staff")
public class Staff {

    @Id
    private String id;
    
    private String fullName;
    
    private String jobTitle; // e.g., "Attendant", "Gardener"
    
    private String hallId; // Which Hall they are assigned to work in
    
    private Double dailyPayRate; // Rate strictly mapping to filtered weekday calculations
}
