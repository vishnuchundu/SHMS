package com.shms.module1.controller;

import com.shms.core.entity.User;
import com.shms.module1.entity.DuesStatus;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StudentControllerTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private HallRepository hallRepository;

    @InjectMocks
    private StudentController studentController;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId("user123");
    }

    @Test
    void getMyAllotment_ValidLinks_ReturnsFlatMap() {
        Student mockStudent = new Student();
        mockStudent.setId("student1");
        mockStudent.setStudentName("Bob");
        mockStudent.setRoomId("room1");
        mockStudent.setDuesStatus(DuesStatus.CLEAR);

        Room mockRoom = new Room();
        mockRoom.setRoomNumber("101");
        mockRoom.setRoomType(RoomType.TWIN);
        mockRoom.setCapacity(2);
        mockRoom.setCurrentOccupancy(1);
        mockRoom.setRentAmount(8000.0);
        mockRoom.setHallId("hallA");

        Hall mockHall = new Hall();
        mockHall.setName("Alpha Hall");
        mockHall.setHallType(HallType.NEW);
        mockHall.setAmenityCharge(1500.0);

        when(studentRepository.findByUserId("user123")).thenReturn(Optional.of(mockStudent));
        when(roomRepository.findById("room1")).thenReturn(Optional.of(mockRoom));
        when(hallRepository.findById("hallA")).thenReturn(Optional.of(mockHall));

        ResponseEntity<?> response = studentController.getMyAllotment(currentUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Bob", body.get("studentName"));
        assertEquals("101", body.get("roomNumber"));
        assertEquals("Alpha Hall", body.get("hallName"));
    }

    @Test
    void getMyStudentProfile_NotFound_ThrowsException() {
        when(studentRepository.findByUserId("user123")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> studentController.getMyAllotment(currentUser));
    }
}
