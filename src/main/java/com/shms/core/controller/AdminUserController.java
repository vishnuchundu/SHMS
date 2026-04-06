package com.shms.core.controller;

import com.shms.audit.service.AuditLogger;
import com.shms.core.entity.Role;
import com.shms.core.entity.User;
import com.shms.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogger auditLogger;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_CHAIRMAN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody UserCreationRequest request, @AuthenticationPrincipal User currentUser) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username intrinsically restricted - already natively exists!");
        }
        
        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole()))
                .build();
                
        userRepository.save(newUser);
        auditLogger.logOperation(currentUser.getId(), "CREATE_USER", newUser.getId(), "Created physical User access map: " + request.getUsername());
        return ResponseEntity.ok(newUser);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id, @AuthenticationPrincipal User currentUser) {
        User target = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User physical bound missing."));
        if (target.getId().equals(currentUser.getId())) {
             throw new RuntimeException("Cannot defensively destroy self-loop mapped account natively.");
        }
        userRepository.delete(target);
        
        auditLogger.logOperation(currentUser.getId(), "DELETE_USER", id, "Physically destroyed User authentication bounds: " + target.getUsername());
        return ResponseEntity.noContent().build();
    }
}

@Data
class UserCreationRequest {
    private String username;
    private String password;
    private String role;
}
