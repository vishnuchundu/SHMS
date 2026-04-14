package com.shms.module2.service;

import com.shms.module1.entity.Hall;
import com.shms.module1.repository.HallRepository;
import com.shms.module2.entity.Payment;
import com.shms.module2.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChequePdfGeneratorServiceTest {

    @Mock
    private HallRepository hallRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private ChequePdfGeneratorService chequePdfGeneratorService;

    @Test
    void generateMonthlyMessCheque_ValidInputs_ReturnsByteArray() {
        Hall hall = new Hall();
        hall.setId("HALL-ALPHA");
        hall.setName("Alpha Hall");

        Payment p1 = new Payment();
        p1.setAmountPaid(5000.0);

        when(hallRepository.findById("HALL-ALPHA")).thenReturn(Optional.of(hall));
        when(paymentRepository.findPaymentsByHallIdAndTimestampBetween(
                anyString(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(p1));

        LocalDateTime start = LocalDateTime.now().minusDays(15);
        LocalDateTime end = LocalDateTime.now();

        byte[] pdfBytes = chequePdfGeneratorService.generateMonthlyMessCheque("HALL-ALPHA", start, end);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0, "PDF byte array should be generated successfully.");
    }

    @Test
    void generateMonthlyMessCheque_HallNotFound_ThrowsException() {
        when(hallRepository.findById("INVALID-HALL")).thenReturn(Optional.empty());

        LocalDateTime start = LocalDateTime.now().minusDays(15);
        LocalDateTime end = LocalDateTime.now();

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                chequePdfGeneratorService.generateMonthlyMessCheque("INVALID-HALL", start, end));

        assertTrue(ex.getMessage().contains("Target Hall mapping for cheque release could not be found."));
    }

    @Test
    void generateMonthlyMessCheque_NoPayments_ThrowsException() {
        Hall hall = new Hall();
        hall.setId("HALL-ALPHA");
        hall.setName("Alpha Hall");

        when(hallRepository.findById("HALL-ALPHA")).thenReturn(Optional.of(hall));
        when(paymentRepository.findPaymentsByHallIdAndTimestampBetween(
                anyString(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of()); // Empty — no payments

        LocalDateTime start = LocalDateTime.now().minusDays(15);
        LocalDateTime end = LocalDateTime.now();

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                chequePdfGeneratorService.generateMonthlyMessCheque("HALL-ALPHA", start, end));

        assertTrue(ex.getMessage().contains("No positive flow collections detected"));
    }
}
