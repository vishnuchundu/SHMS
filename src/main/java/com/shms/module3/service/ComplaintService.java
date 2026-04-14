package com.shms.module3.service;

import com.shms.module1.entity.Room;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.RoomRepository;
import com.shms.module1.repository.StudentRepository;
import com.shms.module3.dto.ComplaintDtos.LodgeComplaintRequest;
import com.shms.module3.dto.ComplaintDtos.UpdateComplaintRequest;
import com.shms.module3.entity.Complaint;
import com.shms.module3.entity.ComplaintStatus;
import com.shms.module3.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final NotificationService notificationService;

    @Transactional
    public Complaint lodgeComplaint(LodgeComplaintRequest request, String studentUserId) {
    
        // 1. Validate Initiator
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new RuntimeException("Target user is not a registered student."));

        // 2. Fetch jurisdiction target (Warden's Hall) dynamically
        Room room = roomRepository.findById(student.getRoomId())
                .orElseThrow(() -> new RuntimeException("Student's current room references an invalid target - cannot map Warden Hall."));

        // 3. Initiate Complaint Ticket
        Complaint complaint = Complaint.builder()
                .studentId(student.getId())
                .hallId(room.getHallId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(ComplaintStatus.OPEN)
                .timestamp(LocalDateTime.now())
                .build();
        
        complaintRepository.save(complaint);

        // 4. Thread-Safe Delay Execution. The student API will NOT block here!
        notificationService.sendWardenNotification(complaint, "Critical Urgent Notification: " + complaint.getTitle());

        return complaint;
    }

    @Transactional
    public Complaint updateComplaintStatus(String complaintId, UpdateComplaintRequest request) {
    
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint ID does not exist."));

        // Strict Structural Constraint Check
        if (request.getStatus() == ComplaintStatus.CLOSED) {
            String atr = request.getAtrDetails();
            if (atr == null || atr.trim().isEmpty()) {
                throw new RuntimeException("CONSTRAINT VIOLATION: Cannot close complaint without providing a valid Action Taken Report (ATR).");
            }
            complaint.setAtrDetails(atr);
            complaint.setResolvedTimestamp(LocalDateTime.now());
            
            // Dispatch response payload concurrently back to the student
            notificationService.sendStudentResolutionNotification(complaint);
        } else if (request.getAtrDetails() != null && !request.getAtrDetails().trim().isEmpty()) {
            complaint.setAtrDetails(request.getAtrDetails());
        }

        complaint.setStatus(request.getStatus());
        
        return complaintRepository.save(complaint);
    }
}
