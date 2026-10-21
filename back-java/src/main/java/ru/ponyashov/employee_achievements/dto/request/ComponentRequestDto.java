package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class ComponentRequestDto {
    @NotBlank(message = "Компонент не должен быть пустым")
    @Size(min = 5, max = 50, message = "Компонент должен быть от 5 до 50 символов")
    private String name;
}