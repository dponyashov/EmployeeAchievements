package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class ProfileRequestDto {

    @Email(message = "Некорректный формат email")
    @NotBlank(message = "Email обязателен")
    private String email;

    @NotBlank(message = "Имя не должно быть пустым")
    @Size(min = 3, max = 20, message = "Имя должно быть от 3 до 20 символов")
    private String firstName;

    @NotBlank(message = "Фамилия не должна быть пустым")
    @Size(min = 5, max = 30, message = "Фамилия должна быть от 5 до 30 символов")
    private String lastName;

//    private Long userId;

    @NotBlank(message = "Код должности не должен быть пустым")
    @Min(value = 1, message = "Код должности должен быть не менее 1")
    private Long positionId;

    @NotBlank(message = "Код отдела не должен быть пустым")
    @Min(value = 1, message = "Код отдела должен быть не менее 1")
    private Long departmentId;
}
