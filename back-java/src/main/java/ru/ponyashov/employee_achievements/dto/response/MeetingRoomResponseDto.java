package ru.ponyashov.employee_achievements.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeetingRoomResponseDto {
    private Long id;
    private String name;
    private Integer capacity;
    private String equipment;
    private Boolean isActive;
}
