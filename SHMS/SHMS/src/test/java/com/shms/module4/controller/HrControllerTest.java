package com.shms.module4.controller;

import com.shms.core.entity.Role;
import com.shms.core.entity.User;
import com.shms.module4.dto.HrDtos.PayrollResultResponse;
import com.shms.module4.dto.HrDtos.RecordLeaveRequest;
import com.shms.module4.entity.LeaveRecord;
import com.shms.module4.entity.Staff;
import com.shms.module4.repository.StaffRepository;
import com.shms.module4.service.LeaveManagementService;
import com.shms.module4.service.PayrollService;
import com.shms.module4.service.SalaryPdfGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class HrControllerTest {

    @Mock
    private LeaveManagementService leaveManagementService;
    @Mock
    private PayrollService payrollService;
    @Mock
    private SalaryPdfGeneratorService salaryPdfGeneratorService;
    @Mock
    private StaffRepository staffRepository;

    @InjectMocks
    private HrController hrController;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId("admin123");
        adminUser.setRole(Role.ADMIN);
    }

    @Test
    void getStaffByHall_ReturnsList() {
        Staff staff1 = new Staff();
        staff1.setId("staff1");
        staff1.setFullName("John Worker");

        when(staffRepository.findByHallId("HALL-A")).thenReturn(List.of(staff1));

        ResponseEntity<List<Staff>> response = hrController.getStaffByHall("HALL-A");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("John Worker", response.getBody().get(0).getFullName());
    }

    @Test
    void recordLeave_ValidPayload_Returns200() {
        RecordLeaveRequest request = new RecordLeaveRequest();
        request.setStaffId("staff1");
        request.setAbsenceDate(LocalDate.of(2026, 4, 15));

        LeaveRecord record = new LeaveRecord();
        record.setId("leave1");
        record.setStaffId("staff1");
        record.setAbsenceDate(LocalDate.of(2026, 4, 15));

        when(leaveManagementService.recordStaffLeave(any(), anyString())).thenReturn(record);

        ResponseEntity<LeaveRecord> response = hrController.recordLeave(request, adminUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("leave1", response.getBody().getId());
        assertEquals("staff1", response.getBody().getStaffId());
    }

    @Test
    void calculateMonthlyPayroll_ValidPayload_Returns200() {
        PayrollResultResponse result = new PayrollResultResponse();
        result.setTotalStaffCalculated(5);
        result.setTotalPayoutDisbursed(250000.0);

        when(payrollService.triggerMonthlySalaryCalculations("2026-04", "admin123")).thenReturn(result);

        ResponseEntity<PayrollResultResponse> response = hrController.calculateMonthlyPayroll("2026-04", adminUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(5, response.getBody().getTotalStaffCalculated());
        assertEquals(250000.0, response.getBody().getTotalPayoutDisbursed());
    }

    @Test
    void pullSalarySlip_ValidPayroll_Returns200WithBase64() {
        when(salaryPdfGeneratorService.generateStaffPaySlip("pay1")).thenReturn(new byte[]{1, 2, 3});

        ResponseEntity<Map<String, String>> response = hrController.pullSalarySlip("pay1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("pay1", response.getBody().get("payrollId"));
        assertNotNull(response.getBody().get("pdfBase64"));
        assertEquals("Extracted slip perfectly encoded.", response.getBody().get("message"));
    }
}
