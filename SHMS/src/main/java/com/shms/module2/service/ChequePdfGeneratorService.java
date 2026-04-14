package com.shms.module2.service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.shms.module1.entity.Hall;
import com.shms.module1.repository.HallRepository;
import com.shms.module2.entity.Payment;
import com.shms.module2.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChequePdfGeneratorService {

    private final HallRepository hallRepository;
    private final PaymentRepository paymentRepository;

    public byte[] generateMonthlyMessCheque(String hallId, LocalDateTime startOfMonth, LocalDateTime endOfMonth) {
        
        // 1. Validate Target Hall
        Hall targetHall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Target Hall mapping for cheque release could not be found."));

        // 2. Aggregate Payments executed explicitly within this framework
        List<Payment> monthlyPayments = paymentRepository.findPaymentsByHallIdAndTimestampBetween(hallId, startOfMonth, endOfMonth);
        
        Double totalClearingSum = monthlyPayments.stream()
                .map(Payment::getAmountPaid)
                .reduce(0.0, Double::sum);
                
        if (totalClearingSum <= 0) {
            throw new RuntimeException("No positive flow collections detected in the given timeframe to issue Cheque.");
        }

        // 3. Draft PDF rendering
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);

            document.open();
            
            // Custom Styling
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font regularFont = new Font(Font.HELVETICA, 12, Font.NORMAL);
            
            document.add(new Paragraph("SHMS STATE BANK LTD.", titleFont));
            document.add(new Paragraph("INSTITUTE CAMPUS BRANCH, MAIN ROAD.", regularFont));
            document.add(new Paragraph("=========================================================="));
            document.add(new Paragraph(""));
            document.add(new Paragraph("Date: " + LocalDateTime.now().toLocalDate().toString(), regularFont));
            document.add(new Paragraph(""));
            document.add(new Paragraph("PAY TO:   MESS ACCOUNT - " + targetHall.getName(), titleFont));
            document.add(new Paragraph(""));
            
            document.add(new Paragraph("THE SUM OF: ₹ " + String.format("%.2f", totalClearingSum), titleFont));
            document.add(new Paragraph("----------------------------------------------------------"));
            document.add(new Paragraph("Cheque Ref: CHQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()));
            document.add(new Paragraph("Authorizer: SYSTEM AUTOMATED DISBURSEMENT"));
            document.add(new Paragraph("Validation: Verified against " + monthlyPayments.size() + " student transactions."));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("System error encountered drafting PDF Cheque payload.", e);
        }
    }
}
