package com.shms.module5.service;

import com.shms.audit.service.AuditLogger;
import com.shms.module5.dto.GrantDtos.AllocateGrantRequest;
import com.shms.module5.dto.GrantDtos.GrantLedgerResponse;
import com.shms.module5.dto.GrantDtos.LogExpenseRequest;
import com.shms.module5.entity.Expense;
import com.shms.module5.entity.Grant;
import com.shms.module5.repository.ExpenseRepository;
import com.shms.module5.repository.GrantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GrantLedgerService {

    private final GrantRepository grantRepository;
    private final ExpenseRepository expenseRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public Grant allocateGrant(AllocateGrantRequest request, String adminUserId) {
    
        Grant grant = Grant.builder()
                .hallId(request.getHallId())
                .grantName(request.getGrantName())
                .allocatedAmount(request.getAllocatedAmount())
                .remainingBalance(request.getAllocatedAmount()) // Initialize cleanly mapped to ceiling
                .createdTimestamp(LocalDateTime.now())
                .build();
                
        grantRepository.save(grant);
        
        auditLogger.logOperation(
            adminUserId, 
            "GRANT_ALLOCATION_AUTHORIZED", 
            grant.getId(), 
            "Admin explicitly funded Grant: " + request.getGrantName() + " | Peak Bound: ₹" + request.getAllocatedAmount()
        );

        return grant;
    }

    @Transactional
    public Expense logExpense(LogExpenseRequest request, String wardenUserId) {
    
        // 1. Resolve Target Grant Framework
        Grant target = grantRepository.findById(request.getGrantId())
                .orElseThrow(() -> new RuntimeException("Target Grant ID maps arbitrarily violating structure."));

        // 2. Validate Originating Jurisdiction mapped to the request matches the targeted Grant's mapping
        if (!target.getHallId().equals(request.getRequestedHallId())) {
            throw new RuntimeException("SECURITY VIOLATION: Access denied. Cannot extract independent ledgers mapped to external proxy jurisdictions.");
        }

        // 3. Mathematical Over-Expenditure Protection
        if (request.getRequestedAmount() > target.getRemainingBalance()) {
            throw new RuntimeException("LEDGER VIOLATION: Explicit limitation constraints blocked this operation. Exact shortfall: ₹" + (request.getRequestedAmount() - target.getRemainingBalance()));
        }

        // 4. Deduct and Execute Output Payload
        target.setRemainingBalance(target.getRemainingBalance() - request.getRequestedAmount());
        grantRepository.save(target);

        Expense deduction = Expense.builder()
                .grantId(target.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .deductedAmount(request.getRequestedAmount())
                .loggedByUserId(wardenUserId)
                .timestamp(LocalDateTime.now())
                .build();

        expenseRepository.save(deduction);
        
        // 5. Trace logging explicitly recording the ledger offset securely
        auditLogger.logOperation(
            wardenUserId, 
            "LOGGED_EXPENSE_DEDUCTION", 
            deduction.getId(), 
            "Deducted ₹" + request.getRequestedAmount() + " from pool: " + target.getGrantName()
        );

        return deduction;
    }

    public GrantLedgerResponse fetchCompleteLedgerTraces(String grantId) {
        
        Grant parent = grantRepository.findById(grantId)
                .orElseThrow(() -> new RuntimeException("Unmapped parent ledger access block."));
                
        List<Expense> localizedExpenses = expenseRepository.findByGrantId(grantId);
        
        return GrantLedgerResponse.builder()
                .parentGrant(parent)
                .associatedExpenses(localizedExpenses)
                .build();
    }
}
