package com.shms.module4.repository;

import com.shms.module4.entity.LeaveRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRecordRepository extends MongoRepository<LeaveRecord, String> {
    Optional<LeaveRecord> findByStaffIdAndAbsenceDate(String staffId, LocalDate date);
    
    @Query("{ 'staffId': ?0, 'absenceDate': { $gte: ?1, $lte: ?2 } }")
    List<LeaveRecord> findByStaffIdAndAbsenceDateWithin(String staffId, LocalDate start, LocalDate end);
}
