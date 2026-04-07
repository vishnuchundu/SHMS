package com.shms.module1.controller;

import com.shms.core.entity.User;
import com.shms.module1.entity.Hall;
import com.shms.module1.entity.Room;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.HallRepository;
import com.shms.module1.repository.RoomRepository;
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
    private final RoomRepository roomRepository;
    private final HallRepository hallRepository;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<Student> getMyStudentProfile(@AuthenticationPrincipal User currentUser) {
        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Logged in User is not structurally registered as a Student physically."));
        return ResponseEntity.ok(student);
    }

    @GetMapping("/my-allotment")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> getMyAllotment(@AuthenticationPrincipal User currentUser) {
        Student student = studentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("No student profile found for this account."));

        Room room = roomRepository.findById(student.getRoomId())
                .orElseThrow(() -> new RuntimeException("Allotted room record not found."));

        Hall hall = hallRepository.findById(room.getHallId())
                .orElseThrow(() -> new RuntimeException("Hall record not found."));

        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("studentId",         student.getId());
        result.put("studentName",       student.getStudentName());
        result.put("duesStatus",        student.getDuesStatus().name());
        result.put("roomNumber",        room.getRoomNumber() != null ? room.getRoomNumber() : "N/A");
        result.put("roomType",          room.getRoomType().name());
        result.put("capacity",          room.getCapacity());
        result.put("currentOccupancy",  room.getCurrentOccupancy());
        result.put("rentAmount",        room.getRentAmount() != null ? room.getRentAmount() : 0.0);
        result.put("hallName",          hall.getName() != null ? hall.getName() : "Hall");
        result.put("hallType",          hall.getHallType().name());
        result.put("amenityCharge",     hall.getAmenityCharge() != null ? hall.getAmenityCharge() : 0.0);
        return ResponseEntity.ok(result);
    }
}
