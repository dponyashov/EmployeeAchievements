package ru.ponyashov.employee_achievements.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import ru.ponyashov.employee_achievements.utils.StringToSortParameterConverter;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final StringToSortParameterConverter stringToSortParameterConverter;

    @Override
    public void addFormatters(FormatterRegistry registry) {
        // Регистрируем наш конвертер в системе маппинга Spring MVC
        registry.addConverter(stringToSortParameterConverter);
    }
}
