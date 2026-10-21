package ru.ponyashov.employee_achievements.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class PrefixConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {

        configurer.addPathPrefix("/api/directory",
                HandlerTypePredicate.forBasePackage("ru.ponyashov.employee_achievements.controller.directory")
                        .and(HandlerTypePredicate.forAnnotation(RestController.class))
        );

        configurer.addPathPrefix("/api/auth",
                HandlerTypePredicate.forBasePackage("ru.ponyashov.employee_achievements.controller.auth")
                        .and(HandlerTypePredicate.forAnnotation(RestController.class))
        );

        configurer.addPathPrefix("/api/task",
                HandlerTypePredicate.forBasePackage("ru.ponyashov.employee_achievements.controller.task")
                        .and(HandlerTypePredicate.forAnnotation(RestController.class))
        );

        configurer.addPathPrefix("/api/report",
                HandlerTypePredicate.forBasePackage("ru.ponyashov.employee_achievements.controller.report")
                        .and(HandlerTypePredicate.forAnnotation(RestController.class))
        );

        configurer.addPathPrefix("/api",
                HandlerTypePredicate.forBasePackage("ru.ponyashov.employee_achievements.controller")
                        .and(HandlerTypePredicate.forAnnotation(RestController.class))
        );

//        configurer.addPathPrefix("/v1",
//                HandlerTypePredicate.forBasePackage("ru.ponyashov.employee_achievements.controller.api")
//                        .and(HandlerTypePredicate.forAnnotation(RestController.class)));
    }
}
