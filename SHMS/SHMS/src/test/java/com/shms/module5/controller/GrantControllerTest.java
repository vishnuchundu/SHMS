package com.shms.module5.controller;

import com.shms.core.entity.Role;
import com.shms.core.entity.User;
import com.shms.module5.dto.GrantDtos.AllocateGrantRequest;
import com.shms.module5.dto.GrantDtos.GrantLedgerResponse;
import com.shms.module5.dto.GrantDtos.LogExpenseRequest;
import com.shms.module5.entity.Expense;
import com.shms.module5.entity.Grant;
import com.shms.module5.repository.GrantRepository;
import com.shms.module5.service.GrantLedgerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GrantControllerTest {

    @Mock
    private GrantLedgerService grantLedgerService;
    @Mock
    private GrantRepository grantRepository;

    @InjectMocks
    private GrantController grantController;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId("admin123");
        adminUser.setRole(Role.ADMIN);
    }

    @Test
    void getAllGrants_ReturnsList() {
        Grant grant = new Grant();
        grant.setId("g1");
        grant.setGrantName("Global Maintenance");

        when(grantRepository.findAll()).thenReturn(List.of(grant));

        ResponseEntity<List<Grant>> response = grantController.getAllGrants();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Global Maintenance", response.getBody().get(0).getGrantName());
    }

    @Test
    void allocateGrant_ValidRequest_ReturnsNewGrant() {
        AllocateGrantRequest request = new AllocateGrantRequest();
        request.setHallId("HALL-B");
        request.setAllocatedAmount(500000.0);
        request.setGrantName("Campus WiFi");

        Grant newGrant = new Grant();
        newGrant.setId("g1");
        newGrant.setHallId("HALL-B");
        newGrant.setAllocatedAmount(500000.0);
        newGrant.setRemainingBalance(500000.0);

        when(grantLedgerService.allocateGrant(any(), anyString())).thenReturn(newGrant);

        ResponseEntity<Grant> response = grantController.allocateGrant(request, adminUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("g1", response.getBody().getId());
        assertEquals(500000.0, response.getBody().getRemainingBalance());
    }

    @Test
    void logExpense_ValidRequest_ReturnsExpense() {
        LogExpenseRequest request = new LogExpenseRequest();
        request.setGrantId("g1");
        request.setRequestedAmount(50000.0);
        request.setTitle("Router Setup");

        Expense exp = new Expense();
        exp.setId("exp1");
        exp.setDeductedAmount(50000.0);

        when(grantLedgerService.logExpense(any(), anyString())).thenReturn(exp);

        ResponseEntity<Expense> response = grantController.logExpense(request, adminUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("exp1", response.getBody().getId());
        assertEquals(50000.0, response.getBody().getDeductedAmount());
    }

    @Test
    void fetchLedger_ReturnsCompiledStructure() {
        Grant parentGrant = new Grant();
        parentGrant.setId("g1");
        parentGrant.setGrantName("Campus WiFi");
        parentGrant.setAllocatedAmount(500000.0);
        parentGrant.setRemainingBalance(450000.0);

        GrantLedgerResponse extraction = GrantLedgerResponse.builder()
                .parentGrant(parentGrant)
                .associatedExpenses(List.of())
                .build();

        when(grantLedgerService.fetchCompleteLedgerTraces("g1")).thenReturn(extraction);

        ResponseEntity<GrantLedgerResponse> response = grantController.fetchLedger("g1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getParentGrant());
        assertEquals("Campus WiFi", response.getBody().getParentGrant().getGrantName());
        assertEquals(450000.0, response.getBody().getParentGrant().getRemainingBalance());
    }
}
