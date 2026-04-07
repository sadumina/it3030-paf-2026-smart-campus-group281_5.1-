package com.backend.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.backend.dto.BookingRequestDTO;
import com.backend.backend.model.Booking;
import com.backend.backend.repository.BookingRepository;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(BookingRequestDTO request) {

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
}
