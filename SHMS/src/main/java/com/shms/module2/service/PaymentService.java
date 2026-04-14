package com.shms.module2.service;

import com.shms.audit.service.AuditLogger;
import com.shms.core.entity.User;
import com.shms.core.repository.UserRepository;
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
        private final UserRepository userRepository;

        @Transactional
        public Payment recordPayment(PaymentRecordRequest request, String executorUserId) {

                // 1. Resolve UI Input Username exactly mapping to internal Database ObjectId
                // boundaries
                User targetUser = userRepository.findByUsername(request.getStudentId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Explicit Target Student Username does not physically exist."));

                // 2. Validate Student bounds exactly
                Student student = studentRepository.findByUserId(targetUser.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Target bounds explicitly does not physically exist as a Student record."));

                // 2. Locate their Hall via their allocated Room
                Room room = roomRepository.findById(student.getRoomId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Student's current room references an invalid link - cannot map to Hall."));

                // 4. Create the concrete Payment log
                Payment payment = Payment.builder()
                                .studentId(student.getId())
                                .hallId(room.getHallId()) // Store snapshot for simple cheque aggregations later
                                .amountPaid(request.getAmountPaid())
                                .paymentMode(request.getPaymentMode())
                                .transactionReference(request.getTransactionReference())
                                .timestamp(LocalDateTime.now())
                                .build();

                paymentRepository.save(payment);

                // 4. Deduct payment proportionally: messDue first, then roomRentDue, then amenitiesDue
                double remaining = request.getAmountPaid();

                double mess = student.getMessDue() != null ? student.getMessDue() : 0.0;
                double rent = student.getRoomRentDue() != null ? student.getRoomRentDue() : 0.0;
                double amenities = student.getAmenitiesDue() != null ? student.getAmenitiesDue() : 0.0;

                double messDeduct = Math.min(mess, remaining);
                mess -= messDeduct;
                remaining -= messDeduct;

                double rentDeduct = Math.min(rent, remaining);
                rent -= rentDeduct;
                remaining -= rentDeduct;

                double amenitiesDeduct = Math.min(amenities, remaining);
                amenities -= amenitiesDeduct;

                student.setMessDue(mess);
                student.setRoomRentDue(rent);
                student.setAmenitiesDue(amenities);

                double resultingDues = mess + rent + amenities;
                student.setDuesStatus(resultingDues <= 0.0 ? DuesStatus.CLEAR : DuesStatus.PENDING);

                studentRepository.save(student);

                // 5. Audit the transaction securely
                auditLogger.logOperation(
                                executorUserId,
                                "RECORDED_PAYMENT_" + request.getPaymentMode().name(),
                                payment.getId(),
                                "Recorded a generic payment resulting in balance: $" + resultingDues);

                return payment;
        }
}
