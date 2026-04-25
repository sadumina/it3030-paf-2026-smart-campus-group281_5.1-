package com.backend.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.backend.backend.dto.BookingPendingUpdateRequest;
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
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Booking createBooking(BookingRequest request, String userEmail) {
        // Validate resource exists and is active
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new NoSuchElementException("Resource not found"));

        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus())) {
            throw new IllegalStateException("Resource is not available for booking");
        }

        validateBookingInput(
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getExpectedAttendees(),
                resource.getCapacity());

        // Validate no overlaps
        checkOverlap(resource.getId(), request.getDate(), request.getStartTime(), request.getEndTime(), null);

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
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus("PENDING");

        Booking saved = bookingRepository.save(booking);

        notificationService.createNotificationsForAdmins(
                "BOOKING_REQUESTED",
                "New Booking Request",
                saved.getUserName() + " requested " + saved.getResourceName() + " on " + saved.getDate(),
                "BOOKING",
                saved.getId());

        return saved;
    }

    private void validateBookingInput(
            java.time.LocalDate date,
            java.time.LocalTime start,
            java.time.LocalTime end,
            Integer expectedAttendees,
            Integer resourceCapacity) {
        if (date == null) {
            throw new IllegalArgumentException("Booking date is required");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past");
        }
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (expectedAttendees != null && expectedAttendees < 1) {
            throw new IllegalArgumentException("Expected attendees must be at least 1");
        }
        if (expectedAttendees != null
                && resourceCapacity != null
                && expectedAttendees > resourceCapacity) {
            throw new IllegalArgumentException("Expected attendees cannot exceed resource capacity");
        }
    }

    private void checkOverlap(
            String resourceId,
            java.time.LocalDate date,
            java.time.LocalTime start,
            java.time.LocalTime end,
            String excludedBookingId) {
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndDateAndStatusIn(
                resourceId,
                date,
                List.of("PENDING", "APPROVED", "CONFIRMED"));

        for (Booking b : existingBookings) {
            if (excludedBookingId != null && excludedBookingId.equals(b.getId())) {
                continue;
            }
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

        User user = userRepository.findByEmail(userEmail).orElse(null);
        String userId = user != null ? user.getId() : null;
        boolean emailMatches = booking.getUserEmail() != null && booking.getUserEmail().equalsIgnoreCase(userEmail);
        boolean idMatches = userId != null && booking.getUserId() != null && booking.getUserId().equals(userId);

        if (!emailMatches && !idMatches) {
            throw new SecurityException("You can only cancel your own bookings");
        }
        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Only pending bookings can be cancelled");
        }

        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotificationsForAdmins(
                "BOOKING_CANCELLED",
                "Booking Cancelled",
                saved.getUserName() + " cancelled " + saved.getResourceName() + " on " + saved.getDate(),
                "BOOKING",
                saved.getId());

        return saved;
    }

    public void deleteBooking(String bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        User user = userRepository.findByEmail(userEmail).orElse(null);
        String userId = user != null ? user.getId() : null;
        boolean emailMatches = booking.getUserEmail() != null && booking.getUserEmail().equalsIgnoreCase(userEmail);
        boolean idMatches = userId != null && booking.getUserId() != null && booking.getUserId().equals(userId);

        if (!emailMatches && !idMatches) {
            throw new SecurityException("You can only delete your own bookings");
        }
        
        bookingRepository.deleteById(bookingId);
    }

    public Booking updatePendingBooking(String bookingId, BookingPendingUpdateRequest request, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        User user = userRepository.findByEmail(userEmail).orElse(null);
        String userId = user != null ? user.getId() : null;
        boolean emailMatches = booking.getUserEmail() != null && booking.getUserEmail().equalsIgnoreCase(userEmail);
        boolean idMatches = userId != null && booking.getUserId() != null && booking.getUserId().equals(userId);

        if (!emailMatches && !idMatches) {
            throw new SecurityException("You can only update your own bookings");
        }
        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Only pending bookings can be updated");
        }

        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new NoSuchElementException("Resource not found"));

        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus())) {
            throw new IllegalStateException("Resource is not available for booking");
        }

        validateBookingInput(
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getExpectedAttendees(),
                resource.getCapacity());

        checkOverlap(
                booking.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                booking.getId());

        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String bookingId, String status, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Only pending bookings can be updated");
        }

        String normalized = status != null ? status.trim().toUpperCase() : "";
        if ("CONFIRMED".equals(normalized)) {
            normalized = "APPROVED";
        }
        if (!List.of("PENDING", "APPROVED", "REJECTED", "CANCELLED").contains(normalized)) {
            throw new IllegalArgumentException("Invalid booking status: " + status);
        }
        if ("REJECTED".equals(normalized) && (reason == null || reason.trim().isEmpty())) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        String previousStatus = booking.getStatus();
        booking.setStatus(normalized);
        booking.setRejectionReason("REJECTED".equals(normalized) ? reason.trim() : null);
        Booking saved = bookingRepository.save(booking);

        if (saved.getUserId() != null) {
            String title = "Booking " + normalized.toLowerCase();
            String message = saved.getResourceName() + " changed from " + previousStatus + " to " + normalized;
            if ("REJECTED".equals(normalized) && saved.getRejectionReason() != null) {
                message += ": " + saved.getRejectionReason();
            }
            notificationService.createNotification(
                    saved.getUserId(),
                    "BOOKING_STATUS_CHANGED",
                    title,
                    message,
                    "BOOKING",
                    saved.getId());
        }

        return saved;
    }
}
