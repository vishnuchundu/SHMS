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
@Document(collection = "halls")
public class Hall {
    
    @Id
    private String id;
    
    private String name;
    
    private HallType hallType; // NEW or OLD
    
    // Configurable flat amount per month charged universally to students in this hall
    private Double amenityCharge; 
}
