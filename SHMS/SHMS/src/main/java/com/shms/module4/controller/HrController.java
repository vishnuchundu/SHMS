package com.shms.module4.controller;

import com.shms.core.entity.User;
import com.shms.module4.dto.HrDtos.PayrollResultResponse;
import com.shms.module4.dto.HrDtos.RecordLeaveRequest;
import com.shms.module4.entity.LeaveRecord;
import com.shms.module4.service.LeaveManagementService;
import com.shms.module4.service.PayrollService;
import com.shms.module4.service.SalaryPdfGeneratorService;
import com.shms.module4.repository.StaffRepository;
import com.shms.module4.entity.Staff;
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

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
public class HrController {

    private final LeaveManagementService leaveManagementService;
    private final PayrollService payrollService;
    private final SalaryPdfGeneratorService salaryPdfGeneratorService;
    private final StaffRepository staffRepository;

    @GetMapping("/staff/hall/{hallId}")
    @PreAuthorize("hasAuthority('ROLE_HALL_CLERK') or hasAuthority('ROLE_CONTROLLING_WARDEN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Staff>> getStaffByHall(@PathVariable String hallId) {
        return ResponseEntity.ok(staffRepository.findByHallId(hallId));
    }

    // Restricted to Hall Clerks logging localized Jurisdictional limits!
    @PostMapping("/leave/record")
    @PreAuthorize("hasAuthority('ROLE_HALL_CLERK') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LeaveRecord> recordLeave(
            @RequestBody RecordLeaveRequest request,
            @AuthenticationPrincipal User currentUser) {
            
        LeaveRecord newlyLogged = leaveManagementService.recordStaffLeave(request, currentUser.getId());
        return ResponseEntity.ok(newlyLogged);
    }

    // Explicit Controlling Warden engine constraint executing bulk calculations
    @PostMapping("/payroll/calculate/{yearMonth}")
    @PreAuthorize("hasAuthority('ROLE_CONTROLLING_WARDEN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PayrollResultResponse> calculateMonthlyPayroll(
            @PathVariable String yearMonth,
            @AuthenticationPrincipal User currentUser) {
            
        PayrollResultResponse stats = payrollService.triggerMonthlySalaryCalculations(yearMonth, currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    // Exposed dynamically generating explicit Salary Slips
    @GetMapping("/payroll/slip/{payrollId}")
    @PreAuthorize("hasAnyAuthority('ROLE_CONTROLLING_WARDEN', 'ROLE_HALL_CLERK', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> pullSalarySlip(
            @PathVariable String payrollId) {

        byte[] output = salaryPdfGeneratorService.generateStaffPaySlip(payrollId);
        String compiledBase64 = Base64.getEncoder().encodeToString(output);

        return ResponseEntity.ok(Map.of(
            "payrollId", payrollId,
            "pdfBase64", compiledBase64,
            "message", "Extracted slip perfectly encoded."
        ));
    }
}
