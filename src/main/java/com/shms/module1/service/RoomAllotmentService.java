package com.shms.module1.service;

import com.shms.audit.service.AuditLogger;
import com.shms.core.entity.User;
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

    @Transactional
    public RegistrationResponse registerAndAllotRoom(RegistrationRequest request, User currentUser) {
        
        // 1. Check if user is already a registered student
        if (studentRepository.findByUserId(currentUser.getId()).isPresent()) {
            throw new RuntimeException("User is already admitted as a student.");
        }

        // 2. Auto-assign the first available room
        Room selectedRoom = roomRepository.findFirstAvailableRoom()
                .orElseThrow(() -> new RuntimeException("No rooms available at maximum capacity."));

        // 3. Fetch Hall Reference
        Hall hall = hallRepository.findById(selectedRoom.getHallId())
                .orElseThrow(() -> new RuntimeException("Hall reference associated with room is invalid."));

        // 4. Calculate Dynamic Rent Based on strict parameters
        double baseRent = 0.0;
        if (hall.getHallType() == HallType.NEW) {
            baseRent += 5000;
        } else if (hall.getHallType() == HallType.OLD) {
            baseRent += 3000;
        }

        if (selectedRoom.getRoomType() == RoomType.SINGLE) {
            baseRent += 10000;
        } else if (selectedRoom.getRoomType() == RoomType.TWIN) {
            baseRent += 8000;
        }

        selectedRoom.setRentAmount(baseRent);

        // 5. Update capacity logic
        if (selectedRoom.getCurrentOccupancy() >= selectedRoom.getCapacity()) {
            throw new RuntimeException("Room capacity exceeded."); // Failsafe
        }
        selectedRoom.setCurrentOccupancy(selectedRoom.getCurrentOccupancy() + 1);
        roomRepository.save(selectedRoom);
        auditLogger.logOperation(currentUser.getId(), "UPDATED_ROOM_OCCUPANCY", selectedRoom.getId(), "Incremented for student admission");

        // 6. Create Student profile manually referenced to User
        Double overallDues = baseRent + (hall.getAmenityCharge() != null ? hall.getAmenityCharge() : 0.0);
        Student newStudent = Student.builder()
                .userId(currentUser.getId())
                .studentName(request.getStudentName())
                .photoFilePath(request.getPhotoFilePath())
                .roomId(selectedRoom.getId())
                .duesStatus(DuesStatus.PENDING)
                .totalDues(overallDues)
                .build();
        
        studentRepository.save(newStudent);
        auditLogger.logOperation(currentUser.getId(), "ADMITTED_STUDENT", newStudent.getId(), "Assigned to room: " + selectedRoom.getId());

        // 7. Generate Allotment Letter PDF as Base64 string payload
        byte[] pdfBytes = pdfGeneratorService.generateAllotmentLetter(newStudent, selectedRoom, hall);
        String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

        return RegistrationResponse.builder()
                .studentId(newStudent.getId())
                .roomId(selectedRoom.getId())
                .totalRentCalculated(overallDues)
                .allotmentLetterBase64(base64Pdf)
                .build();
    }
}
