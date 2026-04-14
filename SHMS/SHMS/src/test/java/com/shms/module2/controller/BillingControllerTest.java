package com.shms.module2.controller;

import com.shms.core.entity.User;
import com.shms.module2.dto.BillingDtos.BatchMessChargeRequest;
import com.shms.module2.service.BillingService;
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
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BillingControllerTest {

    @Mock
    private BillingService billingService;

    @InjectMocks
    private BillingController billingController;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId("admin1");
    }

    @Test
    void batchUpdateMessCharges_ValidPayload_Returns200() {
        BatchMessChargeRequest request = new BatchMessChargeRequest();
        request.setHallId("HALL-A");
        request.setChargePerStudent(3500.0);

        when(billingService.batchUpdateMessCharges(anyString(), anyDouble(), anyString()))
                .thenReturn(50);

        ResponseEntity<Map<String, Object>> response = billingController.batchUpdateMessCharges(request, adminUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Batch billing executed successfully", response.getBody().get("message"));
        assertEquals(50, response.getBody().get("studentsBilled"));
        assertEquals(3500.0, response.getBody().get("chargePerStudent"));
    }
}
