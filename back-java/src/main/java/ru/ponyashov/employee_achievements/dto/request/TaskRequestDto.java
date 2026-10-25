package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

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
    @Size(min = 20, max = 1000, message = "Описание должно быть от 20 до 1000 символов")
    private String description;

    @NotNull(message = "Год не должен быть пустым")
    @Min(value = 1900, message = "Год должен быть не менее 1900")
    @Max(value = 9999, message = "Год не может превышать 9999")
    private Long year;

    @NotNull(message = "Месяц не должен быть пустым")
    @Min(value = 1, message = "Месяц должен быть не менее 1")
    @Max(value = 12, message = "Месяц не может превышать 12")
    private Long month;

    @NotNull(message = "Код сотрудника не должен быть пустым")
    @Min(value = 1, message = "Код сотрудника должен быть не менее 1")
    private Long profileId;

    @NotNull(message = "Код услуги не должен быть пустым")
    @Min(value = 1, message = "Код услуги должен быть не менее 1")
    private Long serviceId;

    @NotNull(message = "Код компонента услуги не должен быть пустым")
    @Min(value = 1, message = "Код компонента услуги должен быть не менее 1")
    private Long componentId;
}
