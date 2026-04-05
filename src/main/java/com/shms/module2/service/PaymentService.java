package com.shms.module2.service;

import com.shms.audit.service.AuditLogger;
import com.shms.module1.entity.DuesStatus;
import com.shms.module1.entity.Room;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.RoomRepository;
import com.shms.module1.repository.StudentRepository;
import com.shms.module2.dto.BillingDtos.PaymentRecordRequest;
import com.shms.module2.entity.Payment;
import com.shms.module2.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public Payment recordPayment(PaymentRecordRequest request, String executorUserId) {
        
        // 1. Validate Student existence
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Target student does not exist."));
                
        // 2. Locate their Hall via their allocated Room
        Room room = roomRepository.findById(student.getRoomId())
                .orElseThrow(() -> new RuntimeException("Student's current room references an invalid link - cannot map to Hall."));

        // 3. Create the concrete Payment log
        Payment payment = Payment.builder()
                .studentId(student.getId())
                .hallId(room.getHallId()) // Store snapshot for simple cheque aggregations later
                .amountPaid(request.getAmountPaid())
                .paymentMode(request.getPaymentMode())
                .transactionReference(request.getTransactionReference())
                .timestamp(LocalDateTime.now())
                .build();
        
        paymentRepository.save(payment);
        
        // 4. Update the Student's total outstanding balance dynamically
        Double currentDues = student.getTotalDues() != null ? student.getTotalDues() : 0.0;
        Double resultingDues = currentDues - request.getAmountPaid();
        student.setTotalDues(resultingDues);
        
        if (resultingDues <= 0) {
            student.setDuesStatus(DuesStatus.CLEAR);
        }
        
        studentRepository.save(student);

        // 5. Audit the transaction securely
        auditLogger.logOperation(
            executorUserId, 
            "RECORDED_PAYMENT_" + request.getPaymentMode().name(), 
            payment.getId(), 
            "Recorded a generic payment resulting in balance: $" + resultingDues
        );

        return payment;
    }
}
