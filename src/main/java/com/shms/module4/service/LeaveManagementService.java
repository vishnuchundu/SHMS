package com.shms.module4.service;

import com.shms.audit.service.AuditLogger;
import com.shms.module4.dto.HrDtos.RecordLeaveRequest;
import com.shms.module4.entity.LeaveRecord;
import com.shms.module4.entity.Staff;
import com.shms.module4.repository.LeaveRecordRepository;
import com.shms.module4.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaveManagementService {

    private final StaffRepository staffRepository;
    private final LeaveRecordRepository leaveRecordRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public LeaveRecord recordStaffLeave(RecordLeaveRequest request, String executorClerkUserId) {
    
        // 1. Resolve Target Staff
        Staff target = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new RuntimeException("Target staff ID does not map to any existing configuration."));

        // 2. Strict jurisdiction compliance checks
        if (!target.getHallId().equals(request.getClerkHallId())) {
            throw new RuntimeException("SECURITY VIOLATION: Hall Clerk cannot mark a leave for a staff member working under a different proxy.");
        }

        // 3. Ensure no overlapping duplicate leave entries for exactly that specific day
        leaveRecordRepository.findByStaffIdAndAbsenceDate(target.getId(), request.getAbsenceDate())
                .ifPresent(existing -> {
                    throw new RuntimeException("A leave record already inherently exists for this active staff on this concrete date.");
                });

        // 4. Record Document Insertion
        LeaveRecord newLeave = LeaveRecord.builder()
                .staffId(target.getId())
                .absenceDate(request.getAbsenceDate())
                .reason(request.getReason())
                .loggedByUserId(executorClerkUserId) // Tracking explicit Clerk who hit the mutation
                .build();
                
        leaveRecordRepository.save(newLeave);

        // 5. Audit Trace Logic
        auditLogger.logOperation(
            executorClerkUserId, 
            "LOGGED_STAFF_LEAVE", 
            target.getId(), 
            "Marked " + target.getJobTitle() + " absent on layout date: " + request.getAbsenceDate()
        );

        return newLeave;
    }
}
