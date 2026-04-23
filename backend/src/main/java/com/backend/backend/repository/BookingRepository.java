package com.backend.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.backend.backend.model.Booking;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByResourceIdAndDateAndStatusNot(String resourceId, LocalDate date, String status);
}
