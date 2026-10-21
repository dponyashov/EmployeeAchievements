package ru.ponyashov.employee_achievements.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

//    @Bean
//    public GroupedOpenApi publicApi() {
//        return GroupedOpenApi.builder()
//                .group("Клиентское API")
//                .pathsToMatch("/api/v1/public/**") // Фильтр по путям
//                .build();
//    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("Административная панель")
                .packagesToScan("ru.ponyashov.employee_achievements.controller.auth") // Или фильтр по пакетам
                .build();
    }

    @Bean
    public GroupedOpenApi directoryApi() {
        return GroupedOpenApi.builder()
                .group("Справочники")
                .packagesToScan("ru.ponyashov.employee_achievements.controller.directory") // Или фильтр по пакетам
                .build();
    }

    @Bean
    public GroupedOpenApi taskApi() {
        return GroupedOpenApi.builder()
                .group("Задачи")
                .packagesToScan("ru.ponyashov.employee_achievements.controller.task") // Или фильтр по пакетам
                .build();
    }

    @Bean
    public GroupedOpenApi reportApi() {
        return GroupedOpenApi.builder()
                .group("Отчетные данные")
                .packagesToScan("ru.ponyashov.employee_achievements.controller.report") // Или фильтр по пакетам
                .build();
    }

    @Bean
    public GroupedOpenApi otherApi() {
        return GroupedOpenApi.builder()
                .group("Дополнительные данные")
                .packagesToScan("ru.ponyashov.employee_achievements.controller.other") // Или фильтр по пакетам
                .build();
    }

    @Bean
    public GroupedOpenApi openApi() {
        return GroupedOpenApi.builder()
                .group("Все данные")
                .packagesToScan("ru.ponyashov.employee_achievements.controller") // Или фильтр по пакетам
                .build();
    }

    @Bean
    public OpenAPI customOpenAPI() {
        String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        ));
    }
}
