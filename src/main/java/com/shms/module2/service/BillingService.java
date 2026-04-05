package com.shms.module2.service;

import com.shms.audit.service.AuditLogger;
import com.shms.module1.entity.DuesStatus;
import com.shms.module1.entity.Room;
import com.shms.module1.entity.Student;
import com.shms.module1.repository.RoomRepository;
import com.shms.module1.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final RoomRepository roomRepository;
    private final StudentRepository studentRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public int batchUpdateMessCharges(String hallId, Double chargePerStudent, String managerUserId) {
        
        // 1. Fetch Rooms in the target Hall
        List<Room> rooms = roomRepository.findByHallId(hallId);
        if (rooms.isEmpty()) {
            return 0; // No rooms in hall
        }

        // 2. Extract Room IDs mapped to the Hall
        List<String> roomIds = rooms.stream()
                .map(Room::getId)
                .collect(Collectors.toList());

        // 3. Find all active students residing in these rooms
        List<Student> students = studentRepository.findByRoomIdIn(roomIds);

        // 4. Batch update their dues
        int count = 0;
        for (Student student : students) {
            Double currentDues = student.getTotalDues() != null ? student.getTotalDues() : 0.0;
            Double updatedDues = currentDues + chargePerStudent;
            
            student.setTotalDues(updatedDues);
            if (updatedDues > 0) {
                student.setDuesStatus(DuesStatus.PENDING);
            }
            count++;
        }
        
        if (count > 0) {
            studentRepository.saveAll(students); // Batch save for performance optimization
            auditLogger.logOperation(
                    managerUserId, 
                    "BATCH_UPDATE_MESS_CHARGE", 
                    hallId, 
                    "Incremented mess charges by $" + chargePerStudent + " for " + count + " students in Hall"
            );
        }

        return count;
    }
}
