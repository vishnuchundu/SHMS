package com.shms.module5.controller;

import com.shms.core.entity.User;
import com.shms.module5.dto.GrantDtos.AllocateGrantRequest;
import com.shms.module5.dto.GrantDtos.GrantLedgerResponse;
import com.shms.module5.dto.GrantDtos.LogExpenseRequest;
import com.shms.module5.entity.Expense;
import com.shms.module5.entity.Grant;
import com.shms.module5.repository.GrantRepository;
import com.shms.module5.service.GrantLedgerService;
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
import java.util.List;

@RestController
@RequestMapping("/api/grants")
@RequiredArgsConstructor
public class GrantController {

    private final GrantLedgerService grantLedgerService;
    private final GrantRepository grantRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_CHAIRMAN')")
    public ResponseEntity<List<Grant>> getAllGrants() {
        return ResponseEntity.ok(grantRepository.findAll());
    }

    @GetMapping("/hall/{hallId}")
    @PreAuthorize("hasAuthority('ROLE_HALL_WARDEN') or hasAuthority('ROLE_CONTROLLING_WARDEN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Grant>> getGrantsByHall(@PathVariable String hallId) {
        return ResponseEntity.ok(grantRepository.findByHallId(hallId));
    }

    // Secured to High-Level Admins pushing large global pool injections.
    @PostMapping("/allocate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_CHAIRMAN')")
    public ResponseEntity<Grant> allocateGrant(
            @RequestBody AllocateGrantRequest request,
            @AuthenticationPrincipal User currentUser) {
            
        Grant response = grantLedgerService.allocateGrant(request, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // Secured exclusively to Wardens routing deductions explicitly mapped isolating their independent branches
    @PostMapping("/expenses/log")
    @PreAuthorize("hasAuthority('ROLE_HALL_WARDEN') or hasAuthority('ROLE_CONTROLLING_WARDEN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Expense> logExpense(
            @RequestBody LogExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {
            
        Expense executedDeduction = grantLedgerService.logExpense(request, currentUser.getId());
        return ResponseEntity.ok(executedDeduction);
    }

    // Extraction Pipeline resolving full dashboard layouts mappings securely
    @GetMapping("/{grantId}/ledger")
    @PreAuthorize("hasAuthority('ROLE_HALL_WARDEN') or hasAuthority('ROLE_CONTROLLING_WARDEN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<GrantLedgerResponse> fetchLedger(
            @PathVariable String grantId) {
            
        GrantLedgerResponse extraction = grantLedgerService.fetchCompleteLedgerTraces(grantId);
        return ResponseEntity.ok(extraction);
    }
}
