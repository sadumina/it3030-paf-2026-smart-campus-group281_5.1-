package com.backend.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.backend.dto.BookingRequestDTO;
import com.backend.backend.model.Booking;
import com.backend.backend.model.BookingStatus;
import com.backend.backend.repository.BookingRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(BookingRequestDTO request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Start time must be in the future");
        }

        List<Booking> conflicts =
                bookingRepository.findByResourceIdAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        request.getResourceId(),
                        request.getEndTime(),
                        request.getStartTime()
                );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked!");
        }

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(request.getUserId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // NEW - User sees only their own bookings
    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    // WORKFLOW: Approve (only PENDING → APPROVED)
    public Booking approveBooking(String id, String adminId) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(adminId);
        return bookingRepository.save(booking);
    }

    // WORKFLOW: Reject (only PENDING → REJECTED)
    public Booking rejectBooking(String id, String reason) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return bookingRepository.save(booking);
    }

    // WORKFLOW: Cancel (only APPROVED → CANCELLED)
    public Booking cancelBooking(String id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
