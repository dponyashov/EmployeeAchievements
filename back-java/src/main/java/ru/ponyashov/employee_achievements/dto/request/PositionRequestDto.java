package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class PositionRequestDto {

    @NotBlank(message = "Должность не должна быть пустой")
    @Size(min = 5, max = 50, message = "Должность должна быть от 5 до 50 символов")
    private String name;
}
