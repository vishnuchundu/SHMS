package com.shms.module3.service;

import com.shms.module3.entity.Complaint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;

@Slf4j
@Service
public class NotificationService {

    @Async
    public void sendWardenNotification(Complaint complaint, String subject) {
        try {
            // Simulating high-latency networking (like SMTP connections)
            Thread.sleep(2000); 
            
            String content = MessageFormat.format(
                "--- ASYNC EMAIL DISPATCH ---\nTo: warden_{0}@shms.edu\nSubject: {1}\nBody: A new complaint '{2}' was lodged by Student {3}.\n---------------------------",
                complaint.getHallId(),
                subject,
                complaint.getTitle(),
                complaint.getStudentId()
            );
            
            log.info("{}", content);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Async notification pool interrupted during email dispatch", e);
        }
    }
    
    @Async
    public void sendStudentResolutionNotification(Complaint complaint) {
        try {
            Thread.sleep(1500); 
            log.info(
                "--- ASYNC EMAIL DISPATCH ---\nTo: student_{}@shms.edu\nSubject: Your Complaint has been Resolved\nBody: Your Warden resolved complaint '{}/{}' with ATR: {}.\n---------------------------",
                complaint.getStudentId(),
                complaint.getId(),
                complaint.getTitle(),
                complaint.getAtrDetails()
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
