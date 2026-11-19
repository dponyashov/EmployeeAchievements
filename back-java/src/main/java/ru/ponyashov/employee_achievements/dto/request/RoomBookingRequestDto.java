package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RoomBookingRequestDto {
    @NotNull(message = "Необходимо выбрать помещение")
    private Long roomId;

    @NotBlank(message = "Укажите тему совещания")
    private String title;

    private String description;

    @NotNull(message = "Укажите дату бронирования")
    private LocalDate bookingDate;

    @NotNull(message = "Укажите время начала")
    private LocalTime startTime;

    @NotNull(message = "Укажите время окончания")
    private LocalTime endTime;
}
