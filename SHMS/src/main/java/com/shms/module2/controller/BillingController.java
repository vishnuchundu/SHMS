package com.shms.module2.controller;

import com.shms.core.entity.User;
import com.shms.module2.dto.BillingDtos.BatchMessChargeRequest;
import com.shms.module2.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    // Secured to MESS_MANAGER or ADMIN orchestrating the mass increments
    @PostMapping("/mess-charges/batch")
    @PreAuthorize("hasAuthority('ROLE_MESS_MANAGER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> batchUpdateMessCharges(
            @RequestBody BatchMessChargeRequest request,
            @AuthenticationPrincipal User currentUser) {

        int affectedStudentsCount = billingService.batchUpdateMessCharges(
                request.getHallId(), 
                request.getChargePerStudent(), 
                currentUser.getId()
        );

        return ResponseEntity.ok(Map.of(
            "message", "Batch billing executed successfully",
            "studentsBilled", affectedStudentsCount,
            "chargePerStudent", request.getChargePerStudent()
        ));
    }
}
