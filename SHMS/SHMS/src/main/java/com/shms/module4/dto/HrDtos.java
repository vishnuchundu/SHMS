package com.shms.module4.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import com.shms.module4.entity.Payroll;

public class HrDtos {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RecordLeaveRequest {
        private String staffId;
        private String clerkHallId; // Used for explicit jurisdiction mapping
        private LocalDate absenceDate;
        private String reason;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PayrollResultResponse {
        private int totalStaffCalculated;
        private String monthKey;
        private Double totalPayoutDisbursed;
        private List<Payroll> generatedPayrolls;
    }
}
