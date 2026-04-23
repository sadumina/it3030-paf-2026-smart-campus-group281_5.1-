package com.backend.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.backend.backend.dto.BookingRequest;
import com.backend.backend.model.Booking;
import com.backend.backend.model.Resource;
import com.backend.backend.model.User;
import com.backend.backend.repository.BookingRepository;
import com.backend.backend.repository.ResourceRepository;
import com.backend.backend.repository.UserRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public BookingService(
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    public Booking createBooking(BookingRequest request, String userEmail) {
        // Validate resource exists and is active
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new NoSuchElementException("Resource not found"));

        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus())) {
            throw new IllegalStateException("Resource is not available for booking");
        }

        // Validate date / time
        if (request.getDate() == null) {
            throw new IllegalArgumentException("Booking date is required");
        }
        if (request.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Validate no overlaps
        checkOverlap(resource.getId(), request.getDate(), request.getStartTime(), request.getEndTime());

        // Resolve user info
        User user = userRepository.findByEmail(userEmail).orElse(null);

        Booking booking = new Booking();
        booking.setResourceId(resource.getId());
        booking.setResourceName(resource.getName());
        booking.setUserEmail(userEmail);
        booking.setUserId(user != null ? user.getId() : null);
        booking.setUserName(user != null ? user.getName() : userEmail);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setStatus("PENDING");

        return bookingRepository.save(booking);
    }

    private void checkOverlap(String resourceId, java.time.LocalDate date, java.time.LocalTime start, java.time.LocalTime end) {
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndDateAndStatusIn(
                resourceId,
                date,
                List.of("PENDING", "CONFIRMED"));

        for (Booking b : existingBookings) {
            if (start.isBefore(b.getEndTime()) && b.getStartTime().isBefore(end)) {
                throw new IllegalStateException("Requested time slot overlaps with an existing booking (" + b.getStartTime() + " - " + b.getEndTime() + ")");
            }
        }
    }

    public List<Booking> getBookingsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return List.of();
        }
        return bookingRepository.findByUserId(user.getId());
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking cancelBooking(String bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (!booking.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalStateException("You can only cancel your own bookings");
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        String normalized = status != null ? status.trim().toUpperCase() : "";
        if (!List.of("PENDING", "CONFIRMED", "REJECTED", "CANCELLED").contains(normalized)) {
            throw new IllegalArgumentException("Invalid booking status: " + status);
        }

        booking.setStatus(normalized);
        return bookingRepository.save(booking);
    }
}
