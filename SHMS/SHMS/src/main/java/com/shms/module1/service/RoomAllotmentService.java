package com.shms.module1.service;

import com.shms.audit.service.AuditLogger;
import com.shms.core.entity.Role;
import com.shms.core.entity.User;
import com.shms.core.repository.UserRepository;
import com.shms.module1.dto.AdmissionDtos.RegistrationRequest;
import com.shms.module1.dto.AdmissionDtos.RegistrationResponse;
import com.shms.module1.entity.DuesStatus;
import com.shms.module1.entity.Hall;
import com.shms.module1.entity.HallType;
import com.shms.module1.entity.Room;
import com.shms.module1.entity.RoomType;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.HallRepository;
import com.shms.module1.repository.RoomRepository;
import com.shms.module1.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RoomAllotmentService {

    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final HallRepository hallRepository;
    private final PdfGeneratorService pdfGeneratorService;
    private final AuditLogger auditLogger;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Derives a clean login username from the student's full name.
     * "John Doe" -> "john.doe", with a numeric suffix if the name is already taken.
     */
    private String deriveUsername(String fullName) {
        String base = fullName.trim().toLowerCase()
                .replaceAll("\\s+", ".")
                .replaceAll("[^a-z0-9.]", "");
        if (base.isBlank()) base = "student";
        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    @Transactional
    public RegistrationResponse registerAndAllotRoom(RegistrationRequest request, User currentUser) {

        // 1. Auto-assign the first available room matching the requested type
        Room selectedRoom = roomRepository.findByRoomType(request.getRoomType())
                .stream()
                .filter(r -> r.getCurrentOccupancy() < r.getCapacity())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Room Capacity Violation: " + request.getRoomType().name() + " occupancy limit reached."));

        // 2. Fetch Hall reference
        Hall hall = hallRepository.findById(selectedRoom.getHallId())
                .orElseThrow(() -> new RuntimeException("Hall reference associated with room is invalid."));

        // 3. Calculate rent based on hall type and room type
        double baseRent = 0.0;
        if (hall.getHallType() == HallType.NEW) baseRent += 5000;
        else if (hall.getHallType() == HallType.OLD) baseRent += 3000;

        if (selectedRoom.getRoomType() == RoomType.SINGLE) baseRent += 10000;
        else if (selectedRoom.getRoomType() == RoomType.TWIN) baseRent += 8000;

        selectedRoom.setRentAmount(baseRent);

        // 4. Increment room occupancy (fail-safe check)
        if (selectedRoom.getCurrentOccupancy() >= selectedRoom.getCapacity()) {
            throw new RuntimeException("Room capacity exceeded.");
        }
        selectedRoom.setCurrentOccupancy(selectedRoom.getCurrentOccupancy() + 1);
        roomRepository.save(selectedRoom);

        // 5. Auto-generate student login credentials and create a User account
        String generatedUsername = deriveUsername(request.getStudentName());
        String defaultPassword = "Welcome@123";

        User studentUser = User.builder()
                .username(generatedUsername)
                .password(passwordEncoder.encode(defaultPassword))
                .role(Role.STUDENT)
                .mustChangePassword(true) // forces password change on first login
                .build();
        userRepository.save(studentUser);

        // 6. Create Student profile linked to the real User ID
        Double baseAmenityCharge = hall.getAmenityCharge() != null ? hall.getAmenityCharge() : 0.0;

        Student newStudent = Student.builder()
                .userId(studentUser.getId())
                .studentName(request.getStudentName())
                .photoFilePath(request.getPhotoFilePath())
                .roomId(selectedRoom.getId())
                .duesStatus(DuesStatus.PENDING)
                .roomRentDue(baseRent)
                .messDue(0.0)
                .amenitiesDue(baseAmenityCharge)
                .build();

        studentRepository.save(newStudent);
        auditLogger.logOperation(currentUser.getId(), "ADMITTED_STUDENT", newStudent.getId(),
                "Room: " + selectedRoom.getId() + " | Login: " + generatedUsername);

        // 7. Generate Allotment Letter PDF
        byte[] pdfBytes = pdfGeneratorService.generateAllotmentLetter(newStudent, selectedRoom, hall);
        String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

        return RegistrationResponse.builder()
                .studentId(newStudent.getId())
                .roomId(selectedRoom.getId())
                .totalRentCalculated(baseRent + baseAmenityCharge)
                .allotmentLetterBase64(base64Pdf)
                .generatedUsername(generatedUsername)
                .defaultPassword(defaultPassword) // shown once to the clerk, never persisted in plain text
                .build();
    }
}
