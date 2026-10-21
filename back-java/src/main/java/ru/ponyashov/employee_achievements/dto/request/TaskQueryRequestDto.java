package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class TaskQueryRequestDto {

    @NotBlank(message = "Номер запроса не должен быть пустым")
    @Size(min = 6, max = 15, message = "Номер запроса должен быть от 6 до 15 символов")
    private String name;
}
