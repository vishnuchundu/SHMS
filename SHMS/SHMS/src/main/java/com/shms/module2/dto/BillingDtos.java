package com.shms.module2.dto;

import com.shms.module2.entity.PaymentMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class BillingDtos {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class BatchMessChargeRequest {
        private String hallId;
        private Double chargePerStudent;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PaymentRecordRequest {
        private String studentId;
        private Double amountPaid;
        private PaymentMode paymentMode;
        private String transactionReference;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class MessChequeResponse {
        private String hallName;
        private String month;
        private Double totalClearanceAmount;
        private String chequePdfBase64;
    }
}
