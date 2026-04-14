package com.shms.module2.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

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
import com.shms.module2.entity.PaymentMode;
import com.shms.module2.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private AuditLogger auditLogger;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentService paymentService;

    private User mockUser;
    private Student mockStudent;
    private Room mockRoom;
    private PaymentRecordRequest request;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId("dbUser1");
        mockUser.setUsername("john.doe");

        mockStudent = new Student();
        mockStudent.setId("student1");
        mockStudent.setRoomId("room101");
        mockStudent.setUserId("dbUser1");
        mockStudent.setDuesStatus(DuesStatus.PENDING);
        mockStudent.setMessDue(2000.0);
        mockStudent.setRoomRentDue(5000.0);
        mockStudent.setAmenitiesDue(1000.0);

        mockRoom = new Room();
        mockRoom.setId("room101");
        mockRoom.setHallId("HALL-A");

        request = new PaymentRecordRequest();
        request.setStudentId("john.doe");
        request.setPaymentMode(PaymentMode.ONLINE);
        request.setTransactionReference("TXN12345");
    }

    @Test
    void recordPayment_FullPayment_ZeroesAllDuesAndSetsClear() {
        request.setAmountPaid(8000.0);

        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(mockUser));
        when(studentRepository.findByUserId("dbUser1")).thenReturn(Optional.of(mockStudent));
        when(roomRepository.findById("room101")).thenReturn(Optional.of(mockRoom));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        Payment result = paymentService.recordPayment(request, "admin1");

        assertNotNull(result);
        assertEquals(8000.0, result.getAmountPaid());
        assertEquals("HALL-A", result.getHallId());
        assertEquals(0.0, mockStudent.getMessDue());
        assertEquals(0.0, mockStudent.getRoomRentDue());
        assertEquals(0.0, mockStudent.getAmenitiesDue());
        assertEquals(DuesStatus.CLEAR, mockStudent.getDuesStatus());

        verify(studentRepository, times(1)).save(mockStudent);
        verify(auditLogger, times(1)).logOperation(eq("admin1"), contains("RECORDED_PAYMENT_ONLINE"), any(), anyString());
    }

    @Test
    void recordPayment_PartialPaymentExceedsMess_SpreadsCorrectly() {
        request.setAmountPaid(4000.0);

        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(mockUser));
        when(studentRepository.findByUserId("dbUser1")).thenReturn(Optional.of(mockStudent));
        when(roomRepository.findById("room101")).thenReturn(Optional.of(mockRoom));

        paymentService.recordPayment(request, "admin1");

        assertEquals(0.0, mockStudent.getMessDue());
        assertEquals(3000.0, mockStudent.getRoomRentDue());
        assertEquals(1000.0, mockStudent.getAmenitiesDue());
        assertEquals(DuesStatus.PENDING, mockStudent.getDuesStatus());
    }

    @Test
    void recordPayment_SevereUnderpayment_DeductsFromMessOnly() {
        request.setAmountPaid(500.0);

        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.of(mockUser));
        when(studentRepository.findByUserId("dbUser1")).thenReturn(Optional.of(mockStudent));
        when(roomRepository.findById("room101")).thenReturn(Optional.of(mockRoom));

        paymentService.recordPayment(request, "admin1");

        assertEquals(1500.0, mockStudent.getMessDue());
        assertEquals(5000.0, mockStudent.getRoomRentDue());
        assertEquals(1000.0, mockStudent.getAmenitiesDue());
        assertEquals(DuesStatus.PENDING, mockStudent.getDuesStatus());
    }

    @Test
    void recordPayment_StudentNotFound_ThrowsException() {
        request.setAmountPaid(1000.0);
        when(userRepository.findByUsername("john.doe")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            paymentService.recordPayment(request, "admin1");
        });
        assertTrue(ex.getMessage().contains("Explicit Target Student Username does not physically exist."));
        verify(studentRepository, never()).save(any());
    }
}
