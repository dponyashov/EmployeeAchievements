package ru.ponyashov.employee_achievements.config;

import io.swagger.v3.oas.models.Paths;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public GlobalOpenApiCustomizer removeTrailingSlashConfiguration() {
        return openApi -> {
            Paths paths = openApi.getPaths();
            if (paths != null) {
                Paths cleanedPaths = new Paths();

                paths.forEach((uri, pathItem) -> {
                    // Если путь заканчивается на "/" и его длина больше 1 (не корневой)
                    if (uri.endsWith("/") && uri.length() > 1) {
                        String cleanUri = uri.substring(0, uri.length() - 1);
                        // Если в схеме уже есть альтернативный путь без "/", то дубликат со слэшем мы ПРОПУСКАЕМ
                        if (paths.containsKey(cleanUri)) {
                            return;
                        }
                    }
                    // Во всех остальных случаях добавляем путь в финальную схему
                    cleanedPaths.addPathItem(uri, pathItem);
                });

                openApi.setPaths(cleanedPaths);
            }
        };
    }
}
