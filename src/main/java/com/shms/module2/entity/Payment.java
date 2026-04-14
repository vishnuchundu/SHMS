package com.shms.module2.entity;

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
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;
    
    private String studentId; // ID of the Student making the payment
    
    private String hallId; // Snapshot of the hall the student belonged to during payment, simplifying aggregate queries
    
    private Double amountPaid;
    
    private PaymentMode paymentMode;
    
    private String transactionReference;
    
    private LocalDateTime timestamp;
}
