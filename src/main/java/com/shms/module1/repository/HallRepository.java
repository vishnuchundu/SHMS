package com.shms.module1.repository;

import com.shms.module1.entity.Hall;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HallRepository extends MongoRepository<Hall, String> {
}
