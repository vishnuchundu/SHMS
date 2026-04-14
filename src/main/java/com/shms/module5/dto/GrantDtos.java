package com.shms.module5.dto;

import com.shms.module5.entity.Expense;
import com.shms.module5.entity.Grant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class GrantDtos {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AllocateGrantRequest {
        private String hallId;
        private String grantName;
        private Double allocatedAmount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LogExpenseRequest {
        private String grantId;
        private String requestedHallId; // Validates calling Warden's jurisdiction against the mapped grant
        private String title;
        private String description;
        private Double requestedAmount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class GrantLedgerResponse {
        private Grant parentGrant;
        private List<Expense> associatedExpenses;
    }
}
