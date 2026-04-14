package com.shms.module3.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.shms.module1.entity.Room;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.RoomRepository;
import com.shms.module1.repository.StudentRepository;
import com.shms.module3.dto.ComplaintDtos.LodgeComplaintRequest;
import com.shms.module3.dto.ComplaintDtos.UpdateComplaintRequest;
import com.shms.module3.entity.Complaint;
import com.shms.module3.entity.ComplaintStatus;
import com.shms.module3.repository.ComplaintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ComplaintService complaintService;

    private Student mockStudent;
    private Room mockRoom;
    private Complaint mockComplaint;

    @BeforeEach
    void setUp() {
        mockStudent = new Student();
        mockStudent.setId("student1");
        mockStudent.setUserId("user1");
        mockStudent.setRoomId("room1");

        mockRoom = new Room();
        mockRoom.setId("room1");
        mockRoom.setHallId("HALL-A");

        mockComplaint = new Complaint();
        mockComplaint.setId("comp1");
        mockComplaint.setStudentId("student1");
        mockComplaint.setHallId("HALL-A");
        mockComplaint.setStatus(ComplaintStatus.OPEN);
    }

    @Test
    void testLodgeComplaint_Success() {
        // Arrange
        LodgeComplaintRequest request = new LodgeComplaintRequest();
        request.setTitle("Fan Broken");
        request.setDescription("Room 202 fan making loud noise.");

        when(studentRepository.findByUserId("user1")).thenReturn(Optional.of(mockStudent));
        when(roomRepository.findById("room1")).thenReturn(Optional.of(mockRoom));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(mockComplaint);

        // Act
        Complaint result = complaintService.lodgeComplaint(request, "user1");

        // Assert
        assertNotNull(result);
        assertEquals(ComplaintStatus.OPEN, result.getStatus());
        assertEquals("HALL-A", result.getHallId());

        verify(complaintRepository, times(1)).save(any(Complaint.class));
        verify(notificationService, times(1)).sendWardenNotification(any(Complaint.class), anyString());
    }

    @Test
    void testUpdateComplaintStatus_ClosedWithoutAtr_ThrowsException() {
        // Arrange
        UpdateComplaintRequest request = new UpdateComplaintRequest();
        request.setStatus(ComplaintStatus.CLOSED);
        request.setAtrDetails(""); // Empty ATR!

        when(complaintRepository.findById("comp1")).thenReturn(Optional.of(mockComplaint));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            complaintService.updateComplaintStatus("comp1", request);
        });

        assertTrue(exception.getMessage().contains("CONSTRAINT VIOLATION"),
                "Expected ATR Guard constraint violation error.");
        verify(complaintRepository, never()).save(any());
        verify(notificationService, never()).sendStudentResolutionNotification(any());
    }

    @Test
    void testUpdateComplaintStatus_ClosedWithAtr_Success() {
        // Arrange
        UpdateComplaintRequest request = new UpdateComplaintRequest();
        request.setStatus(ComplaintStatus.CLOSED);
        request.setAtrDetails("Fixed fan capacitor.");

        when(complaintRepository.findById("comp1")).thenReturn(Optional.of(mockComplaint));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(mockComplaint);

        // Act
        Complaint result = complaintService.updateComplaintStatus("comp1", request);

        // Assert
        assertNotNull(result);
        assertEquals(ComplaintStatus.CLOSED, result.getStatus());
        assertEquals("Fixed fan capacitor.", result.getAtrDetails());

        verify(complaintRepository, times(1)).save(any(Complaint.class));
        verify(notificationService, times(1)).sendStudentResolutionNotification(any(Complaint.class));
    }
}
