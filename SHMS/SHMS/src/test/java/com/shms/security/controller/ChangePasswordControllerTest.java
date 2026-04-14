package com.shms.security.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shms.core.entity.User;
import com.shms.core.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChangePasswordControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ChangePasswordController changePasswordController;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("student1");
        testUser.setPassword("encodedOldPassword");
        testUser.setMustChangePassword(true);
    }

    @Test
    void changePassword_Success_UpdatesAndClearsFlag() {
        // Arrange
        Map<String, String> body = Map.of(
                "currentPassword", "oldPass",
                "newPassword", "newSecurePass"
        );

        when(passwordEncoder.matches("oldPass", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("newSecurePass")).thenReturn("encodedNewPassword");

        // Act
        ResponseEntity<?> response = changePasswordController.changePassword(body, testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository, times(1)).save(testUser);
        assertEquals("encodedNewPassword", testUser.getPassword());
        assertFalse(testUser.isMustChangePassword(), "Must have cleared the flag");
    }

    @Test
    void changePassword_WeakPassword_Returns400() {
        // Arrange
        Map<String, String> body = Map.of(
                "currentPassword", "oldPass",
                "newPassword", "weak"
        );

        // Act
        ResponseEntity<?> response = changePasswordController.changePassword(body, testUser);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_WrongCurrentPassword_Returns400() {
        // Arrange
        Map<String, String> body = Map.of(
                "currentPassword", "wrongOldPass",
                "newPassword", "newSecurePass"
        );

        when(passwordEncoder.matches("wrongOldPass", "encodedOldPassword")).thenReturn(false);

        // Act
        ResponseEntity<?> response = changePasswordController.changePassword(body, testUser);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any());
    }
}
