package ru.ponyashov.employee_achievements.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class RoomBookingResponseDto {
    private Long id;
    private Long roomId;
    private String roomName;
    private Long authorId;
    private Long authorUserId;
    private String authorFullName;
    private String title;
    private String description;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
}
