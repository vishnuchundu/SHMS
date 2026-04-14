package com.shms.module3.repository;

import com.shms.module3.entity.Complaint;
import com.shms.module3.entity.ComplaintStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    
    // Warden can fetch all complaints matching their specific Hall ID
    List<Complaint> findByHallId(String hallId);
    
    // Quick filtering for Open or Closed dashboards
    List<Complaint> findByHallIdAndStatus(String hallId, ComplaintStatus status);
    
    // For students to track their own histories
    List<Complaint> findByStudentId(String studentId);
}
