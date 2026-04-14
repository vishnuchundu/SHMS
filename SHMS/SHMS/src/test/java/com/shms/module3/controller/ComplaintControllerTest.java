package com.shms.module3.controller;

import com.shms.core.entity.Role;
import com.shms.core.entity.User;
import com.shms.module3.dto.ComplaintDtos.LodgeComplaintRequest;
import com.shms.module3.dto.ComplaintDtos.UpdateComplaintRequest;
import com.shms.module3.entity.Complaint;
import com.shms.module3.entity.ComplaintStatus;
import com.shms.module3.repository.ComplaintRepository;
import com.shms.module3.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ComplaintControllerTest {

    @Mock
    private ComplaintService complaintService;

    @Mock
    private ComplaintRepository complaintRepository;

    @InjectMocks
    private ComplaintController complaintController;

    private User studentUser;

    @BeforeEach
    void setUp() {
        studentUser = new User();
        studentUser.setId("student123");
        studentUser.setRole(Role.STUDENT);
    }

    @Test
    void lodgeComplaint_ValidPayload_ReturnsSavedComplaint() {
        LodgeComplaintRequest request = new LodgeComplaintRequest();
        request.setTitle("Leaking Pipe");
        request.setDescription("Water leaking in Room 204");

        Complaint mockComplaint = new Complaint();
        mockComplaint.setId("comp1");
        mockComplaint.setTitle("Leaking Pipe");
        mockComplaint.setStatus(ComplaintStatus.OPEN);

        when(complaintService.lodgeComplaint(any(), anyString())).thenReturn(mockComplaint);

        ResponseEntity<Complaint> response = complaintController.lodgeComplaint(request, studentUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("comp1", response.getBody().getId());
        assertEquals(ComplaintStatus.OPEN, response.getBody().getStatus());
    }

    @Test
    void myComplaints_ReturnsList() {
        Complaint c1 = new Complaint();
        c1.setId("comp1");
        c1.setTitle("Fan issue");

        when(complaintService.getMyComplaints("student123")).thenReturn(List.of(c1));

        ResponseEntity<List<Complaint>> response = complaintController.myComplaints(studentUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Fan issue", response.getBody().get(0).getTitle());
    }

    @Test
    void fetchComplaintsForJurisdiction_WithoutStatusFilter_ReturnsAll() {
        Complaint c1 = new Complaint();
        c1.setId("comp1");
        c1.setTitle("Heater broken");

        when(complaintRepository.findByHallId("HALL-A")).thenReturn(List.of(c1));

        // Call with null status (no filter)
        ResponseEntity<List<Complaint>> response = complaintController.fetchComplaintsForJurisdiction("HALL-A", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void fetchComplaintsForJurisdiction_WithStatusFilter_ReturnsFiltered() {
        Complaint c1 = new Complaint();
        c1.setId("comp1");
        c1.setStatus(ComplaintStatus.OPEN);

        when(complaintRepository.findByHallIdAndStatus("HALL-A", ComplaintStatus.OPEN)).thenReturn(List.of(c1));

        ResponseEntity<List<Complaint>> response = complaintController.fetchComplaintsForJurisdiction("HALL-A", ComplaintStatus.OPEN);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(ComplaintStatus.OPEN, response.getBody().get(0).getStatus());
    }

    @Test
    void updateStatus_ValidClosure_Returns200() {
        UpdateComplaintRequest request = new UpdateComplaintRequest();
        request.setStatus(ComplaintStatus.CLOSED);
        request.setAtrDetails("Replaced the heater element.");

        Complaint updatedComplaint = new Complaint();
        updatedComplaint.setId("comp1");
        updatedComplaint.setStatus(ComplaintStatus.CLOSED);
        updatedComplaint.setAtrDetails("Replaced the heater element.");

        when(complaintService.updateComplaintStatus("comp1", request)).thenReturn(updatedComplaint);

        ResponseEntity<Complaint> response = complaintController.updateStatus("comp1", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(ComplaintStatus.CLOSED, response.getBody().getStatus());
        assertEquals("Replaced the heater element.", response.getBody().getAtrDetails());
    }
}
