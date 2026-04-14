package com.shms.module4.service;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.shms.module4.entity.Payroll;
import com.shms.module4.entity.Staff;
import com.shms.module4.repository.PayrollRepository;
import com.shms.module4.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SalaryPdfGeneratorService {

    private final PayrollRepository payrollRepository;
    private final StaffRepository staffRepository;

    public byte[] generateStaffPaySlip(String payrollId) {
        
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Generated mapping for this slip cannot be physically located."));
                
        Staff associatedStaff = staffRepository.findById(payroll.getStaffId())
                .orElseThrow(() -> new RuntimeException("Explicit staff target linking disconnected."));

        try (ByteArrayOutputStream stream = new ByteArrayOutputStream()) {
            Document pdf = new Document();
            PdfWriter.getInstance(pdf, stream);

            pdf.open();
            pdf.add(new Paragraph("SHMS STAFF PAYROLL SLIP"));
            pdf.add(new Paragraph("======================================"));
            pdf.add(new Paragraph("Target Month Output: " + payroll.getMonthKey()));
            pdf.add(new Paragraph("Issued At: " + LocalDateTime.now()));
            pdf.add(new Paragraph(""));
            pdf.add(new Paragraph("Employee Name: " + associatedStaff.getFullName()));
            pdf.add(new Paragraph("Employee Role: " + associatedStaff.getJobTitle()));
            pdf.add(new Paragraph("Target Hall Proxy: " + associatedStaff.getHallId()));
            pdf.add(new Paragraph(""));
            pdf.add(new Paragraph("--- PAYMENT BREAKDOWN ---"));
            pdf.add(new Paragraph("Daily Compensated Rate: ₹ " + associatedStaff.getDailyPayRate()));
            pdf.add(new Paragraph("Maximum Operational Weekdays: " + payroll.getTotalWorkingDays()));
            pdf.add(new Paragraph("Penalty Leave Days Executed: " + payroll.getLeaveDaysTaken()));
            pdf.add(new Paragraph("Total Payable Days: " + (payroll.getTotalWorkingDays() - payroll.getLeaveDaysTaken())));
            pdf.add(new Paragraph("======================================"));
            pdf.add(new Paragraph("NET DISBURSED AMOUNT: ₹ " + String.format("%.2f", payroll.getNetCalculatedSalary())));
            pdf.add(new Paragraph("======================================"));

            pdf.close();
            return stream.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("System explicit mapping exception resolving Staff Cheque payload constraint.", e);
        }
    }
}
