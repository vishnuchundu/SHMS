package com.shms.security.controller;

import com.shms.core.entity.Role;
import com.shms.core.entity.User;
import com.shms.security.dto.AuthDtos.AuthRequest;
import com.shms.security.dto.AuthDtos.AuthResponse;
import com.shms.security.jwt.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthController authController;

    @Test
    void login_Success_ReturnsJwtAndUserInfo() {
        // Arrange
        AuthRequest request = new AuthRequest();
        request.setUsername("student1");
        request.setPassword("Welcome@123");

        User mockUser = new User();
        mockUser.setUsername("student1");
        mockUser.setRole(Role.STUDENT);
        mockUser.setMustChangePassword(true);

        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(mockUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(jwtUtils.generateToken(mockUser)).thenReturn("mock.jwt.token");

        // Act
        ResponseEntity<AuthResponse> response = authController.login(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("mock.jwt.token", response.getBody().getToken());
        assertEquals("student1", response.getBody().getUsername());
        assertEquals("STUDENT", response.getBody().getRole());
        assertTrue(response.getBody().isMustChangePassword());
    }

    @Test
    void login_InvalidCredentials_ThrowsBadCredentialsException() {
        // Arrange
        AuthRequest request = new AuthRequest();
        request.setUsername("student1");
        request.setPassword("wrongpass");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> authController.login(request));
        verify(jwtUtils, never()).generateToken(any());
    }
}
