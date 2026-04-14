package com.shms.module4.service;

import com.shms.audit.service.AuditLogger;
import com.shms.module4.dto.HrDtos.PayrollResultResponse;
import com.shms.module4.entity.LeaveRecord;
import com.shms.module4.entity.Payroll;
import com.shms.module4.entity.Staff;
import com.shms.module4.repository.LeaveRecordRepository;
import com.shms.module4.repository.PayrollRepository;
import com.shms.module4.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final StaffRepository staffRepository;
    private final LeaveRecordRepository leaveRecordRepository;
    private final PayrollRepository payrollRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public PayrollResultResponse triggerMonthlySalaryCalculations(String monthKey, String executorUserId) {
    
        // 1. Explicitly unpack month key validation (Format: YYYY-MM)
        YearMonth targetMonth;
        try {
            targetMonth = YearMonth.parse(monthKey, DateTimeFormatter.ofPattern("yyyy-MM"));
        } catch (Exception e) {
            throw new RuntimeException("Validation Error: parameter must strictly map to 'YYYY-MM' format.");
        }

        // 2. Algorithm calculating total mapped week days (Excluding S/S)
        int totalWeekdaysInMonth = 0;
        int lengthOfMonth = targetMonth.lengthOfMonth();
        for (int day = 1; day <= lengthOfMonth; day++) {
            LocalDate exactDate = targetMonth.atDay(day);
            DayOfWeek dayOfWeek = exactDate.getDayOfWeek();
            if (dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY) {
                totalWeekdaysInMonth++;
            }
        }

        // 3. Payroll Batch Resolution Pipeline
        List<Staff> activeStaffers = staffRepository.findAll();
        List<Payroll> computedPayrolls = new ArrayList<>();
        double sumTotalDistributed = 0.0;

        for (Staff currStaff : activeStaffers) {
        
            // Ensure no re-runs if it already exists to bypass duplicates scaling overlaps
            if (payrollRepository.findByStaffIdAndMonthKey(currStaff.getId(), monthKey).isPresent()) {
                continue; 
            }

            LocalDate start = targetMonth.atDay(1);
            LocalDate end = targetMonth.atEndOfMonth();
            
            List<LeaveRecord> loggedLeaves = leaveRecordRepository.findByStaffIdAndAbsenceDateWithin(currStaff.getId(), start, end);
            
            // Only deduct mapping leaves affecting Weekdays natively
            int penaltyLeaves = 0;
            for (LeaveRecord lr : loggedLeaves) {
                DayOfWeek d = lr.getAbsenceDate().getDayOfWeek();
                if (d != DayOfWeek.SATURDAY && d != DayOfWeek.SUNDAY) {
                    penaltyLeaves++;
                }
            }

            int payableDays = totalWeekdaysInMonth - penaltyLeaves;
            if (payableDays < 0) payableDays = 0; // Absolute bound fail-safe

            Double payout = (double) payableDays * currStaff.getDailyPayRate();

            Payroll structGeneration = Payroll.builder()
                    .staffId(currStaff.getId())
                    .monthKey(monthKey)
                    .totalWorkingDays(totalWeekdaysInMonth)
                    .leaveDaysTaken(penaltyLeaves)
                    .netCalculatedSalary(payout)
                    .generatedAt(LocalDateTime.now())
                    .build();

            computedPayrolls.add(structGeneration);
            sumTotalDistributed += payout;
        }

        if (!computedPayrolls.isEmpty()) {
            payrollRepository.saveAll(computedPayrolls);
            // Master Execute Log
            auditLogger.logOperation(
                executorUserId, 
                "PAYROLL_TRIGGER_BATCH", 
                monthKey, 
                "A total of " + computedPayrolls.size() + " payroll slips validated and queued!"
            );
        }

        return PayrollResultResponse.builder()
                .monthKey(monthKey)
                .totalStaffCalculated(computedPayrolls.size())
                .totalPayoutDisbursed(sumTotalDistributed)
                .generatedPayrolls(computedPayrolls)
                .build();
    }
}
