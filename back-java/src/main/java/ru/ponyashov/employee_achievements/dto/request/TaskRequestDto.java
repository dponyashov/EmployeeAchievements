package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;


@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class TaskRequestDto {

    @NotBlank(message = "Заголовок не должен быть пустым")
    @Size(min = 20, max = 100, message = "Заголовок должен быть от 20 до 100 символов")
    private String title;

    @NotBlank(message = "Описание не должно быть пустым")
    @Size(min = 20, max = 500, message = "Описание должно быть от 20 до 500 символов")
    private String description;

    @NotBlank(message = "Год не должен быть пустым")
    @Min(value = 1900, message = "Год должен быть не менее 1900")
    @Max(value = 9999, message = "Год не может превышать 9999")
    private Long year;

    @NotBlank(message = "Месяц не должен быть пустым")
    @Min(value = 1, message = "Месяц должен быть не менее 1")
    @Max(value = 12, message = "Месяц не может превышать 12")
    private Long month;
//    private LocalDate enterDate;
//    private LocalTime enterTime;
    @NotBlank(message = "Код сотрудника не должен быть пустым")
    @Min(value = 1, message = "Код сотрудника должен быть не менее 1")
    private Long profileId;

    @NotBlank(message = "Код услуги не должен быть пустым")
    @Min(value = 1, message = "Код услуги должен быть не менее 1")
    private Long serviceId;

    @NotBlank(message = "Код компонента услуги не должен быть пустым")
    @Min(value = 1, message = "Код компонента услуги должен быть не менее 1")
    private Long componentId;
}
