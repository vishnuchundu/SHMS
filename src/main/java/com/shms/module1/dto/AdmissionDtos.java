package com.shms.module1.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AdmissionDtos {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RegistrationRequest {
        private String studentName;
        private String photoFilePath;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class RegistrationResponse {
        private String studentId;
        private String roomId;
        private Double totalRentCalculated;
        private String allotmentLetterBase64; // Will send direct link/file in controller but keeping byte payload handy
    }
}
