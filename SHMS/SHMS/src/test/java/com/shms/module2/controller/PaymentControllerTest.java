package com.shms.module2.controller;

import com.shms.core.entity.User;
import com.shms.module2.dto.BillingDtos.PaymentRecordRequest;
import com.shms.module2.entity.Payment;
import com.shms.module2.entity.PaymentMode;
import com.shms.module2.service.ChequePdfGeneratorService;
import com.shms.module2.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private ChequePdfGeneratorService chequePdfGeneratorService;

    @InjectMocks
    private PaymentController paymentController;

    private User executingUser;

    @BeforeEach
    void setUp() {
        executingUser = new User();
        executingUser.setId("clerk1");
    }

    @Test
    void recordPayment_ValidPayload_Returns200() {
        PaymentRecordRequest request = new PaymentRecordRequest();
        request.setStudentId("student1");
        request.setAmountPaid(5000.0);
        request.setPaymentMode(PaymentMode.ONLINE);
        request.setTransactionReference("TXN001");

        Payment mockPayment = Payment.builder()
                .id("pay1")
                .amountPaid(5000.0)
                .paymentMode(PaymentMode.ONLINE)
                .build();

        when(paymentService.recordPayment(any(), anyString())).thenReturn(mockPayment);

        ResponseEntity<?> response = paymentController.recordPayment(request, executingUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("Payment has been processed entirely", body.get("message"));
        assertEquals("pay1", body.get("transactionId"));
        assertEquals(5000.0, body.get("amount"));
        assertEquals("ONLINE", body.get("method"));
    }

    @Test
    void recordPayment_RuntimeFailure_Returns400() {
        PaymentRecordRequest request = new PaymentRecordRequest();
        request.setStudentId("notfound");

        when(paymentService.recordPayment(any(), anyString()))
                .thenThrow(new RuntimeException("Explicit Target Student Username does not physically exist."));

        ResponseEntity<?> response = paymentController.recordPayment(request, executingUser);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertNotNull(body);
        assertEquals("Explicit Target Student Username does not physically exist.", body.get("message"));
    }

    @Test
    void drawChequeForHall_ValidParams_Returns200() {
        byte[] mockPdf = new byte[]{10, 20, 30};
        when(chequePdfGeneratorService.generateMonthlyMessCheque(anyString(), any(), any()))
                .thenReturn(mockPdf);

        ResponseEntity<?> response = paymentController.drawChequeForHall("HALL-A", 4);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}
