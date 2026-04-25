package com.backend.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.backend.backend.dto.BookingRequestDTO;
import com.backend.backend.model.Booking;
import com.backend.backend.model.BookingStatus;
import com.backend.backend.model.Resource;
import com.backend.backend.repository.BookingRepository;
import com.backend.backend.repository.ResourceRepository;

@Service
public class BookingService {

    // Statuses that "consume" capacity  (PENDING + APPROVED)
    private static final List<BookingStatus> ACTIVE_STATUSES =
            List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    public Booking createBooking(BookingRequestDTO request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Start time must be in the future");
        }

        // --- Capacity check ---
        // Only count PENDING/APPROVED bookings in the requested window
        List<Booking> overlapping = bookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        request.getResourceId(),
                        ACTIVE_STATUSES,
                        request.getEndTime(),
                        request.getStartTime());

        int usedCapacity = overlapping.stream()
                .mapToInt(b -> b.getExpectedAttendees() != null ? b.getExpectedAttendees() : 0)
                .sum();

        // Try to get resource capacity; if found, enforce the limit
        resourceRepository.findById(request.getResourceId()).ifPresent(resource -> {
            Integer maxCapacity = resource.getCapacity();
            if (maxCapacity != null) {
                int incoming = request.getExpectedAttendees() != null ? request.getExpectedAttendees() : 1;
                if (usedCapacity + incoming > maxCapacity) {
                    int remaining = maxCapacity - usedCapacity;
                    throw new RuntimeException(
                            "Capacity full! This resource can only accommodate "
                                    + maxCapacity + " people. "
                                    + (remaining > 0
                                    ? "Only " + remaining + " spot(s) remaining for this time slot."
                                    : "No spots remaining for this time slot."));
                }
            }
        });

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(request.getUserId());
        booking.setStudentId(request.getStudentId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return bookingRepository.save(booking);
    }

    /**
     * Returns remaining capacity for a resource in a given time window.
     * Returns -1 if the resource has no capacity limit defined.
     */
    public int getAvailableCapacity(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        Resource resource = resourceRepository.findById(resourceId).orElse(null);
        if (resource == null || resource.getCapacity() == null) {
            return -1; // no limit
        }

        List<Booking> overlapping = bookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        resourceId,
                        ACTIVE_STATUSES,
                        endTime,
                        startTime);

        int used = overlapping.stream()
                .mapToInt(b -> b.getExpectedAttendees() != null ? b.getExpectedAttendees() : 0)
                .sum();

        return Math.max(0, resource.getCapacity() - used);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // User sees only their own bookings (excluding DELETED ones)
    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .filter(b -> b.getStatus() != BookingStatus.DELETED)
                .toList();
    }

    // WORKFLOW: Approve (only PENDING -> APPROVED)
    public Booking approveBooking(String id, String adminId) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(adminId);
        return bookingRepository.save(booking);
    }

    // WORKFLOW: Reject (only PENDING -> REJECTED)
    public Booking rejectBooking(String id, String reason) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return bookingRepository.save(booking);
    }

    // WORKFLOW: Cancel (only APPROVED -> CANCELLED)
    public Booking cancelBooking(String id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    // WORKFLOW: Student soft-deletes (only PENDING -> DELETED)
    public Booking softDeleteBooking(String id, String userId) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be deleted");
        }
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own bookings");
        }
        booking.setStatus(BookingStatus.DELETED);
        booking.setDeletedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    // Admin: get all soft-deleted bookings sorted newest first
    public List<Booking> getDeletedBookings() {
        return bookingRepository.findByStatusOrderByDeletedAtDesc(BookingStatus.DELETED);
    }

    // Scheduled: permanently remove DELETED bookings older than 7 days (runs at midnight daily)
    @Scheduled(cron = "0 0 0 * * *")
    public void purgeOldDeletedBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<Booking> toDelete =
                bookingRepository.findByStatusAndDeletedAtBefore(BookingStatus.DELETED, cutoff);
        if (!toDelete.isEmpty()) {
            bookingRepository.deleteAll(toDelete);
        }
    }
}
