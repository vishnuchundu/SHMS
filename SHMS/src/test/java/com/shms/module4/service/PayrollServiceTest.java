package com.shms.module4.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.shms.audit.service.AuditLogger;
import com.shms.module4.dto.HrDtos.PayrollResultResponse;
import com.shms.module4.entity.LeaveRecord;
import com.shms.module4.entity.Staff;
import com.shms.module4.repository.LeaveRecordRepository;
import com.shms.module4.repository.PayrollRepository;
import com.shms.module4.repository.StaffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class PayrollServiceTest {

    @Mock
    private StaffRepository staffRepository;
    @Mock
    private LeaveRecordRepository leaveRecordRepository;
    @Mock
    private PayrollRepository payrollRepository;
    @Mock
    private AuditLogger auditLogger;

    @InjectMocks
    private PayrollService payrollService;

    private Staff mockStaff;
    private LeaveRecord mockLeaveRecord;

    @BeforeEach
    void setUp() {
        mockStaff = new Staff();
        mockStaff.setId("staff1");
        mockStaff.setDailyPayRate(500.0); // 500 per day

        mockLeaveRecord = new LeaveRecord();
        mockLeaveRecord.setStaffId("staff1");
        // We set the absence date to a specific known weekday (e.g., April 15, 2026 is a Wednesday)
        mockLeaveRecord.setAbsenceDate(LocalDate.of(2026, 4, 15));
    }

    @Test
    void testTriggerMonthlySalaryCalculations_InvalidDateFormat_ThrowsException() {
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            payrollService.triggerMonthlySalaryCalculations("2026/04", "warden1");
        });
        assertTrue(exception.getMessage().contains("YYYY-MM"));
    }

    @Test
    void testTriggerMonthlySalaryCalculations_CalculatesDeductionsCorrectly() {
        // April 2026 has 30 days. April 2026 starts on a Wednesday.
        // It has 4 complete weekends (8 days) + 0 extra weekend days = 22 Weekdays natively.
        String targetMonth = "2026-04";

        when(payrollRepository.findByStaffIdAndMonthKey("staff1", targetMonth)).thenReturn(Optional.empty());
        when(staffRepository.findAll()).thenReturn(List.of(mockStaff));
        when(leaveRecordRepository.findByStaffIdAndAbsenceDateWithin(eq("staff1"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(mockLeaveRecord)); // 1 absence on a Wednesday

        PayrollResultResponse result = payrollService.triggerMonthlySalaryCalculations(targetMonth, "warden1");

        assertNotNull(result);
        assertEquals(1, result.getTotalStaffCalculated());
        
        // 22 Weekdays - 1 Penalty Leave = 21 Payable Days.
        // 21 * 500 = 10500.0
        assertEquals(10500.0, result.getTotalPayoutDisbursed(), "Payroll abstraction calculation must exclude exact weekends and deduct explicit weekday penalty leaves mathematically");

        verify(payrollRepository, times(1)).saveAll(any());
        verify(auditLogger, times(1)).logOperation(eq("warden1"), anyString(), eq(targetMonth), anyString());
    }
}
