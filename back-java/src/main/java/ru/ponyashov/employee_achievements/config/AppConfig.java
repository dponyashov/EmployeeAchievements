package ru.ponyashov.employee_achievements.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

@Validated // Заставит приложение упасть с понятной ошибкой, если что-то пойдет не так
@ConfigurationProperties(prefix = "app.variables")
public record AppConfig(
        String frontUrl,

        @Valid // Каскадная валидация обязательна в Spring Boot 3.4+ / 4.x для рекордов
        @NotNull
        @DefaultValue // Инструктирует Spring создать пустой объект с дефолтными примитивами, если ветки нет в YAML
        Jwt jwt
) {
    public record Jwt(
            String atSecretKey,
            String rtSecretKey,

            // Если в YAML будет null/пусто, подставятся значения по умолчанию прямо в Record
//            @DefaultValue("900000")
            Long atExpiration,
//            @DefaultValue("604800000")
            Long rtExpiration
    ) {}
}