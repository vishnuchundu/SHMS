package com.shms.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDtos {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AuthRequest {
        private String username;
        private String password;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String username;
        private String role;
    }
}
