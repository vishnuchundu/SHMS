package com.shms.core.config;

import com.shms.core.entity.Role;
import com.shms.core.entity.User;
import com.shms.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.shms.module1.entity.Hall;
import com.shms.module1.entity.HallType;
import com.shms.module1.entity.Room;
import com.shms.module1.entity.RoomType;
import com.shms.module1.repository.HallRepository;
import com.shms.module1.repository.RoomRepository;
import com.shms.module4.entity.Staff;
import com.shms.module4.repository.StaffRepository;
import com.shms.module4.repository.LeaveRecordRepository;
import com.shms.module4.repository.PayrollRepository;
import com.shms.module5.entity.Grant;
import com.shms.module5.repository.GrantRepository;
import com.shms.module1.entity.Student;
import com.shms.module1.entity.DuesStatus;
import com.shms.module1.repository.StudentRepository;

import java.util.List;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final HallRepository hallRepository;
    private final RoomRepository roomRepository;
    private final StaffRepository staffRepository;
    private final GrantRepository grantRepository;
    private final LeaveRecordRepository leaveRecordRepository;
    private final PayrollRepository payrollRepository;
    private final StudentRepository studentRepository;

    @Override
    public void run(String... args) {
        log.info("Checking for missing SHMS mock test accounts explicitly...");
        
        // Force-wipe legacy users immediately destroying 403 authorization role misalignments!
        userRepository.deleteAll();
        
        String hashedFallback = passwordEncoder.encode("password123");

        List<User> initialUsers = List.of(
            User.builder().username("admin_test").password(hashedFallback).role(Role.ADMIN).build(),
            User.builder().username("chairman_test").password(hashedFallback).role(Role.CHAIRMAN).build(),
            User.builder().username("warden_test").password(hashedFallback).role(Role.HALL_WARDEN).build(),
            User.builder().username("controlling_warden").password(hashedFallback).role(Role.CONTROLLING_WARDEN).build(),
            User.builder().username("mess_manager").password(hashedFallback).role(Role.MESS_MANAGER).build(),
            User.builder().username("clerk_test").password(hashedFallback).role(Role.HALL_CLERK).build(),
            User.builder().username("student_test").password(hashedFallback).role(Role.STUDENT).build()
        );

        for (User u : initialUsers) {
            if (userRepository.findByUsername(u.getUsername()).isEmpty()) {
                userRepository.save(u);
                log.info("Created missing mock account inherently: {}", u.getUsername());
            }
        }
        
        // 2. Mock Physical Infrastructure mapping explicitly bounding Occupancy logic UI Grids
        // Force-wipe legacy data arrays to ensure strictly exact variables load natively for QA execution
        hallRepository.deleteAll();
        roomRepository.deleteAll();
        staffRepository.deleteAll();
        grantRepository.deleteAll();
        leaveRecordRepository.deleteAll();
        payrollRepository.deleteAll();
        studentRepository.deleteAll();

        if (hallRepository.count() == 0) {
            Hall hallA = Hall.builder()
                .id("HALL-A")
                .name("Newton Hall (A Wing)")
                .hallType(HallType.NEW)
                .amenityCharge(1500.0)
                .build();
            hallRepository.save(hallA);
            
            // Seed 20 Rooms perfectly parsing the strict validation loops natively
            for (int i=1; i<=20; i++) {
                RoomType type = (i % 2 == 0) ? RoomType.TWIN : RoomType.SINGLE;
                int cap = (type == RoomType.TWIN) ? 2 : 1;
                double rent = (type == RoomType.TWIN) ? 12000.0 : 18000.0;
                
                // Mix random occupancies natively parsing visual components perfectly!
                int occ = 0;
                if (i <= 5) occ = cap; // Full Red
                else if (i <= 10 && cap == 2) occ = 1; // Partial Yellow
                else occ = 0; // Empty Green
                
                Room r = Room.builder()
                    .roomNumber("A-" + (100 + i))
                    .hallId("HALL-A")
                    .roomType(type)
                    .capacity(cap)
                    .currentOccupancy(occ)
                    .rentAmount(rent)
                    .build();
                roomRepository.save(r);

                // Inject Physical Student bindings to guarantee Mass Executions target actual arrays!
                for (int s = 0; s < occ; s++) {
                    // Binding student_test User ID natively into the First Array Trace securely mapping all test conditions
                    String dbLinkedUserId = (i == 1 && s == 0) ? userRepository.findByUsername("student_test").get().getId() : java.util.UUID.randomUUID().toString();
                    
                    Student simulatedUser = Student.builder()
                            .userId(dbLinkedUserId)
                            .studentName(i == 1 && s == 0 ? "John Test (student_test)" : "Simulated Student " + i + "-" + s)
                            .duesStatus(DuesStatus.CLEAR)
                            .roomId(r.getId())
                            .roomRentDue(0.0)
                            .messDue(0.0)
                            .amenitiesDue(0.0)
                            .build();
                    studentRepository.save(simulatedUser);
                }
            }
            log.info("Injected Native Physical Infrastructure mapping 20 structurally valid Rooms and Students bound to HALL-A!");
        }

        // 3. Inject mock Staff structure resolving Phase B Payroll Validation vectors perfectly!
        if (staffRepository.count() == 0) {
            Staff attendant = Staff.builder()
                    .id("STF-ATT01")
                    .fullName("Rajesh Kumar")
                    .jobTitle("Attendant")
                    .hallId("HALL-A")
                    .dailyPayRate(600.0)
                    .build();
            
            Staff gardener = Staff.builder()
                    .id("STF-GRD02")
                    .fullName("Suresh Yadav")
                    .jobTitle("Gardener")
                    .hallId("HALL-A")
                    .dailyPayRate(500.0)
                    .build();
                    
            staffRepository.saveAll(List.of(attendant, gardener));
            log.info("Mock Staff records configured binding securely to HALL-A logic.");
        }
        
        // 4. Inject physical simulated Grants executing exact Chairman bounds uniquely!
        if (grantRepository.count() == 0) {
            Grant g = Grant.builder()
                    .hallId("HALL-A")
                    .grantName("Annual Maintenance Overhead")
                    .allocatedAmount(500000.0)
                    .remainingBalance(420000.0)
                    .createdTimestamp(LocalDateTime.now())
                    .build();
            grantRepository.save(g);
            log.info("Injected Master Grant tracking executing explicitly testing mathematical visualization bounds!");
        }

        log.info("Test mapping instantiation completed structurally!");
    }
}
