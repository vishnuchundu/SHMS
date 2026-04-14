package com.shms.module5.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.shms.audit.service.AuditLogger;
import com.shms.module5.dto.GrantDtos.AllocateGrantRequest;
import com.shms.module5.dto.GrantDtos.LogExpenseRequest;
import com.shms.module5.entity.Expense;
import com.shms.module5.entity.Grant;
import com.shms.module5.repository.ExpenseRepository;
import com.shms.module5.repository.GrantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class GrantLedgerServiceTest {

    @Mock
    private GrantRepository grantRepository;
    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private AuditLogger auditLogger;

    @InjectMocks
    private GrantLedgerService grantLedgerService;

    private Grant mockGrant;

    @BeforeEach
    void setUp() {
        mockGrant = Grant.builder()
                .id("grant1")
                .hallId("HALL-B")
                .grantName("Campus WiFi Expansion")
                .allocatedAmount(750000.0)
                .remainingBalance(750000.0)
                .createdTimestamp(LocalDateTime.now())
                .build();
    }

    @Test
    void testAllocateGrant_Success() {
        // Arrange
        AllocateGrantRequest request = new AllocateGrantRequest();
        request.setHallId("HALL-C");
        request.setGrantName("Test Allocation");
        request.setAllocatedAmount(100000.0);

        when(grantRepository.save(any(Grant.class))).thenAnswer(i -> {
            Grant g = i.getArgument(0);
            g.setId("newGrant123");
            return g;
        });

        // Act
        Grant result = grantLedgerService.allocateGrant(request, "admin1");

        // Assert
        assertNotNull(result);
        assertEquals("HALL-C", result.getHallId());
        assertEquals(100000.0, result.getRemainingBalance());
        
        verify(grantRepository, times(1)).save(any(Grant.class));
        verify(auditLogger, times(1)).logOperation(eq("admin1"), eq("GRANT_ALLOCATION_AUTHORIZED"), any(), anyString());
    }

    @Test
    void testLogExpense_OverExpenditureBlock_ThrowsException() {
        // Arrange
        LogExpenseRequest request = new LogExpenseRequest();
        request.setGrantId("grant1");
        request.setRequestedHallId("HALL-B");
        request.setTitle("Over the limit");
        // Remaining is 750,000. Request 9,000,000.
        request.setRequestedAmount(9000000.0);

        when(grantRepository.findById("grant1")).thenReturn(Optional.of(mockGrant));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            grantLedgerService.logExpense(request, "warden1");
        });

        assertTrue(exception.getMessage().contains("LEDGER VIOLATION"));
        assertTrue(exception.getMessage().contains("Explicit limitation constraints blocked this operation."));
        
        // Assert no structural modifications happened
        verify(expenseRepository, never()).save(any());
        verify(grantRepository, never()).save(any()); // Save should NOT be called to mutate target
        assertEquals(750000.0, mockGrant.getRemainingBalance(), "Mathematical balance must remain completely untouched upon violation block.");
    }

    @Test
    void testLogExpense_ValidDeduction_Success() {
        // Arrange
        LogExpenseRequest request = new LogExpenseRequest();
        request.setGrantId("grant1");
        request.setRequestedHallId("HALL-B");
        request.setTitle("Broken Water Pipes");
        request.setRequestedAmount(25000.0);

        when(grantRepository.findById("grant1")).thenReturn(Optional.of(mockGrant));
        
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> {
            Expense e = invocation.getArgument(0);
            e.setId("expense1");
            return e;
        });

        // Act
        Expense result = grantLedgerService.logExpense(request, "warden1");

        // Assert
        assertNotNull(result);
        assertEquals(25000.0, result.getDeductedAmount());
        assertEquals(725000.0, mockGrant.getRemainingBalance(), "Ledger must securely detach the requested bounds from the origin array.");
        
        verify(grantRepository, times(1)).save(mockGrant);
        verify(expenseRepository, times(1)).save(any(Expense.class));
        verify(auditLogger, times(1)).logOperation(eq("warden1"), eq("LOGGED_EXPENSE_DEDUCTION"), any(), anyString());
    }
}
