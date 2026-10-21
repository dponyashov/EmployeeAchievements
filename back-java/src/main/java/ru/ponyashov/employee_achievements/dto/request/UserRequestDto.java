package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class UserRequestDto {

    @Email(message = "Некорректный формат email")
    @NotBlank(message = "Email обязателен")
    private String userName;

    @NotBlank(message = "Пароль не должен быть пустым")
    @Size(min = 6, max = 25, message = "Пароль должен быть от 6 до 25 символов")
    private String password;
}
