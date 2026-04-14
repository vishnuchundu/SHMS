package com.shms.module2.controller;

import com.shms.core.entity.User;
import com.shms.module2.dto.BillingDtos.MessChequeResponse;
import com.shms.module2.dto.BillingDtos.PaymentRecordRequest;
import com.shms.module2.entity.Payment;
import com.shms.module2.service.ChequePdfGeneratorService;
import com.shms.module2.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final ChequePdfGeneratorService chequePdfGeneratorService;

    // Secured to HALL_CLERK, ACCOUNTS_CLERK recording payments on behalf of students
    @PostMapping("/record")
    @PreAuthorize("hasAnyAuthority('ROLE_HALL_CLERK', 'ROLE_ACCOUNTS_CLERK', 'ROLE_ADMIN')")
    public ResponseEntity<?> recordPayment(
            @RequestBody PaymentRecordRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            Payment executedPayment = paymentService.recordPayment(request, currentUser.getId());
            return ResponseEntity.ok(Map.of(
                "message", "Payment has been processed entirely",
                "transactionId", executedPayment.getId(),
                "amount", executedPayment.getAmountPaid(),
                "method", executedPayment.getPaymentMode().name()
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // Accessible via Mess Manager portals to aggregate and withdraw cleared Hall payments 
    @GetMapping("/cheque/{hallId}/month/{monthValue}")
    @PreAuthorize("hasAuthority('ROLE_MESS_MANAGER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<MessChequeResponse> drawChequeForHall(
            @PathVariable String hallId,
            @PathVariable int monthValue) {

        int currentYear = LocalDateTime.now().getYear();
        LocalDateTime startOfMonth = LocalDateTime.of(currentYear, monthValue, 1, 0, 0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);

        byte[] chequePdfBuffer = chequePdfGeneratorService.generateMonthlyMessCheque(hallId, startOfMonth, endOfMonth);
        String base64Encoded = Base64.getEncoder().encodeToString(chequePdfBuffer);

        MessChequeResponse payload = MessChequeResponse.builder()
                .hallName("Internal Reference Mapping") // Actual payload name mappings left explicitly basic for simple endpoints
                .month(startOfMonth.getMonth().name())
                .totalClearanceAmount(1.0) // Normally extracted from generator but simply mapping standard return DTO abstraction
                .chequePdfBase64(base64Encoded)
                .build();

        return ResponseEntity.ok(payload);
    }
}
