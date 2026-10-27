package ru.ponyashov.employee_achievements.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target(ElementType.TYPE) // Вешается на класс
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = LoginRequestDtoValidator.class)
public @interface ValidLogin {
    String message() default "Некорректный формат email";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

