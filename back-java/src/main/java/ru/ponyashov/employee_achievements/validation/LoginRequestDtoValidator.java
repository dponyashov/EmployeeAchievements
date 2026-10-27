package ru.ponyashov.employee_achievements.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import ru.ponyashov.employee_achievements.dto.request.LoginRequestDto;

import java.util.regex.Pattern;

public class LoginRequestDtoValidator implements ConstraintValidator<ValidLogin, LoginRequestDto> {

    // Стандартное регулярное выражение для проверки Email (как в аннотации @Email)
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );

    @Override
    public boolean isValid(LoginRequestDto dto, ConstraintValidatorContext context) {
        if (dto == null || dto.getUserName() == null) {
            return true; // Пустые значения пусть обрабатывает @NotBlank
        }

        // Главное условие: если "admin", то валидация успешна (исключение из правил)
        if ("admin".equalsIgnoreCase(dto.getUserName().trim())) {
            return true;
        }

        // Для всех остальных значений проверяем формат email
        boolean isValidEmail = EMAIL_PATTERN.matcher(dto.getUserName()).matches();

        if (!isValidEmail) {
            // Привязываем ошибку конкретно к полю userName, а не ко всему классу
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                    .addPropertyNode("userName")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}
