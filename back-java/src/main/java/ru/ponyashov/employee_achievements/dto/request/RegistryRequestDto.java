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
public class RegistryRequestDto {

    @Email(message = "Некорректный формат email")
    @NotBlank(message = "Email обязателен")
    private String userName;

    @NotBlank(message = "Пароль не должен быть пустым")
    @Size(min = 6, max = 25, message = "Пароль должен быть от 6 до 25 символов")
    private String password;

//    @NotBlank(message = "Имя не должно быть пустым")
    @Size(min = 3, max = 20, message = "Имя должно быть от 3 до 20 символов")
    private String firstName;

//    @NotBlank(message = "Фамилия не должна быть пустым")
    @Size(min = 5, max = 30, message = "Фамилия должна быть от 5 до 30 символов")
    private String lastName;
}
