package com.shms.security.controller;

import com.shms.core.entity.User;
import com.shms.security.dto.AuthDtos.AuthRequest;
import com.shms.security.dto.AuthDtos.AuthResponse;
import com.shms.security.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User userDetails = (User) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(userDetails);

        AuthResponse response = AuthResponse.builder()
                .token(jwt)
                .username(userDetails.getUsername())
                .role(userDetails.getRole().name())
                .mustChangePassword(userDetails.isMustChangePassword())
                .build();

        return ResponseEntity.ok(response);
    }
}
