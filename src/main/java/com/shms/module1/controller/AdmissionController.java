package com.shms.module1.controller;

import com.shms.core.entity.User;
import com.shms.module1.dto.AdmissionDtos.RegistrationRequest;
import com.shms.module1.dto.AdmissionDtos.RegistrationResponse;
import com.shms.module1.service.RoomAllotmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admissions")
@RequiredArgsConstructor
public class AdmissionController {

    private final RoomAllotmentService roomAllotmentService;

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> registerStudent(
            @RequestBody RegistrationRequest request,
            @AuthenticationPrincipal User currentUser) {
        
        RegistrationResponse response = roomAllotmentService.registerAndAllotRoom(request, currentUser);
        return ResponseEntity.ok(response);
    }
}
