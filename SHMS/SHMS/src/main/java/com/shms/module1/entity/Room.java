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
@Document(collection = "rooms")
public class Room {

    @Id
    private String id;
    
    private String roomNumber;
    
    private String hallId; // Manual Reference to Hall
    
    private RoomType roomType; // SINGLE or TWIN
    
    private Integer capacity; // e.g. 1 or 2
    
    private Integer currentOccupancy; // e.g. 0, 1, or 2
    
    // Calculated rent amount depending on the dynamically established baseline
    private Double rentAmount;
}
