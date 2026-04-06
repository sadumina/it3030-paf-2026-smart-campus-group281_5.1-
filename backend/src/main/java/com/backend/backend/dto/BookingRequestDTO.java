package com.backend.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {

    private String resourceId;
    private String userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
}