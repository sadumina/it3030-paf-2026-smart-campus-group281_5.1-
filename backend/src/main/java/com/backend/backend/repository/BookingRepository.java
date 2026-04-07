package com.backend.backend.repository;

import com.backend.backend.model.Booking;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByResourceIdAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
        String resourceId,
        LocalDateTime endTime,
        LocalDateTime startTime
    );
    
}
