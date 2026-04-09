package com.backend.backend.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String resourceId;           // Will link to Module A later
    private String userId;               // Temporary - will come from JWT later
    private String studentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;

    private BookingStatus status = BookingStatus.PENDING;
    private String rejectionReason;
    private String approvedBy;

    @CreatedDate
    private LocalDateTime createdAt;
}