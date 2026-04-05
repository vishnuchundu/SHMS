package com.shms.module2.repository;

import com.shms.module2.entity.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    
    // Custom query fetching all payments corresponding to a particular Hall within a timeframe
    @Query("{ 'hallId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
    List<Payment> findPaymentsByHallIdAndTimestampBetween(String hallId, LocalDateTime start, LocalDateTime end);
}
