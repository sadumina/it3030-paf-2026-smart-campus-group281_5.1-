package com.backend.backend.repository;

import com.backend.backend.model.Booking;
import com.backend.backend.model.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByResourceId(String resourceId);

    List<Booking> findByResourceIdAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
        String resourceId,
        LocalDateTime endTime,
        LocalDateTime startTime
    );

    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    // Find all soft-deleted bookings (for admin dashboard)
    List<Booking> findByStatusOrderByDeletedAtDesc(BookingStatus status);

    // Find DELETED bookings whose deletedAt is before a given cutoff (for 7-day purge)
    List<Booking> findByStatusAndDeletedAtBefore(BookingStatus status, LocalDateTime cutoff);
}
