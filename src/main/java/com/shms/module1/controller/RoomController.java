package com.shms.module1.controller;

import com.shms.module1.entity.Room;
import com.shms.module1.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRepository roomRepository;

    @GetMapping("/hall/{hallId}")
    @PreAuthorize("hasAnyAuthority('ROLE_HALL_WARDEN', 'ROLE_CONTROLLING_WARDEN', 'ROLE_ADMIN', 'ROLE_HALL_CLERK')")
    public ResponseEntity<List<Room>> getRoomsByHall(@PathVariable String hallId) {
        List<Room> mappedRooms = roomRepository.findByHallId(hallId);
        return ResponseEntity.ok(mappedRooms);
    }
}
