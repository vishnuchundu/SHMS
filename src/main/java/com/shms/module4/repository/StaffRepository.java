package com.shms.module4.repository;

import com.shms.module4.entity.Staff;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffRepository extends MongoRepository<Staff, String> {
    List<Staff> findByHallId(String hallId);
}
