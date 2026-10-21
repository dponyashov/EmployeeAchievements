package ru.ponyashov.employee_achievements.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@Schema(description = "DTO - Запрос на изменение роли")
public class RoleRequestDto {

    @NotBlank(message = "Роль не должна быть пустым")
    @Size(min = 6, max = 35, message = "Роль должна быть от 6 до 35 символов")
    @Pattern(regexp = "^ROLE_.*", message = "Название роли должно начинаться с 'ROLE_'")

    @Schema(
            description = "Уникальное имя роли",
            example = "ROLE_ADMIN", // Тот самый пример заполнения в Swagger
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String name;

    @NotBlank(message = "Описание роли не должно быть пустым")
    @Size(min = 10, max = 150, message = "Описание роли не должно от 10 до 150 символов")

    @Schema(
            description = "Описание роли",
            example = "Роль для администраторов приложения", // Тот самый пример заполнения в Swagger
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String description;
}
