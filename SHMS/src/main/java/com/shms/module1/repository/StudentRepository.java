package com.shms.module1.repository;

import com.shms.module1.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByUserId(String userId);
    
    List<Student> findByRoomIdIn(List<String> roomIds);
}
