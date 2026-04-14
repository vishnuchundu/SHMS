package com.shms.module1.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.shms.audit.service.AuditLogger;
import com.shms.core.entity.Role;
import com.shms.core.entity.User;
import com.shms.core.repository.UserRepository;
import com.shms.module1.dto.AdmissionDtos.RegistrationRequest;
import com.shms.module1.dto.AdmissionDtos.RegistrationResponse;
import com.shms.module1.entity.Hall;
import com.shms.module1.entity.HallType;
import com.shms.module1.entity.Room;
import com.shms.module1.entity.RoomType;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.HallRepository;
import com.shms.module1.repository.RoomRepository;
import com.shms.module1.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class RoomAllotmentServiceTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private HallRepository hallRepository;
    @Mock
    private PdfGeneratorService pdfGeneratorService;
    @Mock
    private AuditLogger auditLogger;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private RoomAllotmentService roomAllotmentService;

    private User adminUser;
    private RegistrationRequest registrationRequest;
    private Room singleRoom;
    private Hall newHall;

    @BeforeEach
    void setUp() {
        adminUser = User.builder().id("admin1").username("admin").role(Role.ADMIN).build();
        
        registrationRequest = new RegistrationRequest();
        registrationRequest.setStudentName("John Doe");
        registrationRequest.setRoomType(RoomType.SINGLE);
        
        singleRoom = new Room();
        singleRoom.setId("room1");
        singleRoom.setHallId("hallA");
        singleRoom.setRoomType(RoomType.SINGLE);
        singleRoom.setCapacity(1);
        singleRoom.setCurrentOccupancy(0);
        
        newHall = new Hall();
        newHall.setId("hallA");
        newHall.setHallType(HallType.NEW);
        newHall.setAmenityCharge(1500.0);
    }

    @Test
    void testRegisterAndAllotRoom_Success() {
        // Arrange
        when(roomRepository.findByRoomType(RoomType.SINGLE)).thenReturn(List.of(singleRoom));
        when(hallRepository.findById("hallA")).thenReturn(Optional.of(newHall));
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(pdfGeneratorService.generateAllotmentLetter(any(), any(), any())).thenReturn(new byte[]{1, 2, 3});
        
        // Act
        RegistrationResponse response = roomAllotmentService.registerAndAllotRoom(registrationRequest, adminUser);
        
        // Assert
        assertNotNull(response);
        assertEquals("john.doe", response.getGeneratedUsername());
        assertEquals("room1", response.getRoomId());
        
        // Base Rent (New Hall -> 5000, Single Room -> 10000) = 15000 + Amenities (1500) = 16500
        assertEquals(16500.0, response.getTotalRentCalculated());
        
        verify(roomRepository, times(1)).save(singleRoom);
        assertEquals(1, singleRoom.getCurrentOccupancy()); // Should increment occupancy
        
        verify(userRepository, times(1)).save(any(User.class));
        verify(studentRepository, times(1)).save(any(Student.class));
        verify(auditLogger, times(1)).logOperation(eq(adminUser.getId()), eq("ADMITTED_STUDENT"), any(), anyString());
    }

    @Test
    void testRegisterAndAllotRoom_CapacityViolation() {
        // Arrange
        singleRoom.setCurrentOccupancy(1); // Room is full
        when(roomRepository.findByRoomType(RoomType.SINGLE)).thenReturn(List.of(singleRoom));
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            roomAllotmentService.registerAndAllotRoom(registrationRequest, adminUser);
        });
        
        assertEquals("Room Capacity Violation: SINGLE occupancy limit reached.", exception.getMessage());
        verify(hallRepository, never()).findById(any());
    }
}
