package com.shms.module4.repository;

import com.shms.module4.entity.Payroll;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayrollRepository extends MongoRepository<Payroll, String> {
    Optional<Payroll> findByStaffIdAndMonthKey(String staffId, String monthKey);
}
