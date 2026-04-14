package com.shms.module5.repository;

import com.shms.module5.entity.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByGrantId(String grantId); // Extracts full deduction log spanning the root
}
