package com.shms.module3.dto;

import com.shms.module3.entity.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ComplaintDtos {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class LodgeComplaintRequest {
        private String title;
        private String description;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UpdateComplaintRequest {
        private ComplaintStatus status;
        private String atrDetails; // Action Taken Report content
    }
}
