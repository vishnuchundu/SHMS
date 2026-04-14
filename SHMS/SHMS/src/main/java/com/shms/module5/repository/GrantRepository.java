package com.shms.module5.repository;

import com.shms.module5.entity.Grant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrantRepository extends MongoRepository<Grant, String> {
    List<Grant> findByHallId(String hallId); // Wardens filtering explicitly for localized funding
}
