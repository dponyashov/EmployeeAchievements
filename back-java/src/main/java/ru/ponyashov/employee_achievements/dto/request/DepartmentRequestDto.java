package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class DepartmentRequestDto {

    @NotBlank(message = "Отдел не должен быть пустым")
    @Size(min = 5, max = 50, message = "Отдел должен быть от 5 до 50 символов")
    private String name;
}
