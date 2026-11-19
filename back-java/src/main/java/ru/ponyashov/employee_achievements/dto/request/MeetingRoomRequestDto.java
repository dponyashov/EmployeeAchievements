package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MeetingRoomRequestDto {
    @NotBlank(message = "Наименование помещения обязательно")
    private String name;

    @Min(value = 1, message = "Вместимость должна быть не менее 1 человека")
    private Integer capacity = 1;

    private String equipment;
    private Boolean isActive = true;
}
