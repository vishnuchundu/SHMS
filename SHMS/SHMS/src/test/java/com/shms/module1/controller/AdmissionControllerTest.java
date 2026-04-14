package com.shms.module1.controller;

import com.shms.core.entity.User;
import com.shms.module1.dto.AdmissionDtos.RegistrationRequest;
import com.shms.module1.dto.AdmissionDtos.RegistrationResponse;
import com.shms.module1.entity.RoomType;
import com.shms.module1.service.RoomAllotmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdmissionControllerTest {

    @Mock
    private RoomAllotmentService roomAllotmentService;

    @InjectMocks
    private AdmissionController admissionController;

    private User executingUser;

    @BeforeEach
    void setUp() {
        executingUser = new User();
        executingUser.setId("clerk1");
    }

    @Test
    void registerStudent_Success_ReturnsProperPayload() {
        RegistrationRequest request = new RegistrationRequest();
        request.setStudentName("Test Student");
        request.setRoomType(RoomType.TWIN);

        RegistrationResponse mockResponse = RegistrationResponse.builder()
                .studentId("student123")
                .generatedUsername("test.student")
                .defaultPassword("Welcome@123")
                .build();

        when(roomAllotmentService.registerAndAllotRoom(any(), any())).thenReturn(mockResponse);

        ResponseEntity<RegistrationResponse> response = admissionController.registerStudent(request, executingUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("student123", response.getBody().getStudentId());
        assertEquals("test.student", response.getBody().getGeneratedUsername());
        assertEquals("Welcome@123", response.getBody().getDefaultPassword());
    }

    @Test
    void registerStudent_ServiceThrows_PropagatesRuntimeException() {
        RegistrationRequest request = new RegistrationRequest();
        when(roomAllotmentService.registerAndAllotRoom(any(), any()))
                .thenThrow(new RuntimeException("Room Capacity Violation: TWIN occupancy limit reached."));

        // The controller has no try/catch — it propagates the exception
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> admissionController.registerStudent(request, executingUser));

        assertTrue(ex.getMessage().contains("Room Capacity Violation"));
    }
}
