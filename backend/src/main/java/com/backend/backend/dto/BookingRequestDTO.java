package com.backend.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {
    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Start time is required")
    @Future
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future
    private LocalDateTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    private Integer expectedAttendees;
}