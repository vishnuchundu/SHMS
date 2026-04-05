package com.shms.module1.repository;

import com.shms.module1.entity.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    
    // Auto-assign: Find any room that still has capacity taking an optional hallId filter.
    // If you specifically want to find universally, find first where currentOccupancy < capacity
    @Query("{ $expr: { $lt: ['$currentOccupancy', '$capacity'] } }")
    Optional<Room> findFirstAvailableRoom();
    
    List<Room> findByHallId(String hallId);
}
