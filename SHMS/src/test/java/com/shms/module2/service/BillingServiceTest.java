package com.shms.module2.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.shms.audit.service.AuditLogger;
import com.shms.module1.entity.DuesStatus;
import com.shms.module1.entity.Room;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.RoomRepository;
import com.shms.module1.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

@ExtendWith(MockitoExtension.class)
public class BillingServiceTest {

    @Mock
    private RoomRepository roomRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private AuditLogger auditLogger;

    @InjectMocks
    private BillingService billingService;

    private Room mockRoom;
    private Student mockStudent;

    @BeforeEach
    void setUp() {
        mockRoom = new Room();
        mockRoom.setId("room101");
        mockRoom.setHallId("HALL-A");

        mockStudent = new Student();
        mockStudent.setId("student1");
        mockStudent.setRoomId("room101");
        mockStudent.setMessDue(1000.0);
        mockStudent.setDuesStatus(DuesStatus.CLEAR);
    }

    @Test
    void testBatchUpdateMessCharges_EmptyHall_ReturnsZero() {
        when(roomRepository.findByHallId("HALL-EMPTY")).thenReturn(Collections.emptyList());

        int count = billingService.batchUpdateMessCharges("HALL-EMPTY", 3500.0, "mess_mgr1");

        assertEquals(0, count);
        verify(studentRepository, never()).findByRoomIdIn(any());
        verify(studentRepository, never()).saveAll(any());
    }

    @Test
    void testBatchUpdateMessCharges_ValidStudents_AccumulatesProperly() {
        when(roomRepository.findByHallId("HALL-A")).thenReturn(List.of(mockRoom));
        when(studentRepository.findByRoomIdIn(List.of("room101"))).thenReturn(List.of(mockStudent));

        int count = billingService.batchUpdateMessCharges("HALL-A", 3500.0, "mess_mgr1");

        assertEquals(1, count);
        assertEquals(4500.0, mockStudent.getMessDue(), "Previous due (1000) must accumulate the new batch charge (3500).");
        assertEquals(DuesStatus.PENDING, mockStudent.getDuesStatus(), "Student status must physically shift to PENDING upon non-zero balance.");

        verify(studentRepository, times(1)).saveAll(any());
        verify(auditLogger, times(1)).logOperation(eq("mess_mgr1"), eq("BATCH_UPDATE_MESS_CHARGE"), eq("HALL-A"), anyString());
    }
}
