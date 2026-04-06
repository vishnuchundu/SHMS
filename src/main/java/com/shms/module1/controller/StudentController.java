package com.shms.module1.controller;

import com.shms.core.entity.User;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Student> getMyStudentProfile(@AuthenticationPrincipal User currentUser) {
        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Logged in User is not structurally registered as a Student physically."));
        
        return ResponseEntity.ok(student);
    }
}
