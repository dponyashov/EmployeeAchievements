package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import ru.ponyashov.employee_achievements.validation.ValidLogin;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@ValidLogin
public class LoginRequestDto {

    @NotBlank(message = "Email обязателен")
//    @Email(message = "Некорректный формат email")
    private String userName;

    @NotBlank(message = "Пароль не должен быть пустым")
    @Size(min = 6, max = 25, message = "Пароль должен быть от 6 до 25 символов")
    private String password;
}
