package com.backend.backend.controller;

import com.backend.backend.dto.BookingRequestDTO;
import com.backend.backend.model.Booking;
import com.backend.backend.service.BookingService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public Booking createBooking(@RequestBody BookingRequestDTO request) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/my")
    public List<Booking> getMyBookings(@RequestParam String userId) {
        return bookingService.getMyBookings(userId);
    }

    @GetMapping("/{id}")
    public Booking getBookingById(@PathVariable String id) {
        return bookingService.getBookingById(id);
    }

    @PutMapping("/{id}/approve")
    public Booking approveBooking(@PathVariable String id, @RequestParam(defaultValue = "ADMIN-001") String adminId) {
        return bookingService.approveBooking(id, adminId);
    }

    @PutMapping("/{id}/reject")
    public Booking rejectBooking(@PathVariable String id, @RequestParam String reason) {
        return bookingService.rejectBooking(id, reason);
    }

    @PutMapping("/{id}/cancel")
    public Booking cancelBooking(@PathVariable String id) {
        return bookingService.cancelBooking(id);
    }

    // Student soft-deletes a PENDING booking; userId ensures ownership check
    @DeleteMapping("/{id}")
    public Booking softDeleteBooking(@PathVariable String id, @RequestParam String userId) {
        return bookingService.softDeleteBooking(id, userId);
    }

    // Admin: list all soft-deleted bookings
    @GetMapping("/deleted")
    public List<Booking> getDeletedBookings() {
        return bookingService.getDeletedBookings();
    }

    /**
     * Returns the remaining available capacity for a resource in a time window.
     * Used by the frontend to preview capacity before the student submits.
     *
     * GET /api/bookings/capacity?resourceId=...&startTime=...&endTime=...
     * Response: { "available": 25, "unlimited": false }
     */
    @GetMapping("/capacity")
    public ResponseEntity<Map<String, Object>> getAvailableCapacity(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        int available = bookingService.getAvailableCapacity(resourceId, startTime, endTime);
        boolean unlimited = available == -1;
        return ResponseEntity.ok(Map.of(
                "available", unlimited ? Integer.MAX_VALUE : available,
                "unlimited", unlimited
        ));
    }
}
