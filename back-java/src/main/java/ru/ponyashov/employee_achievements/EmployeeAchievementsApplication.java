package ru.ponyashov.employee_achievements;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import ru.ponyashov.employee_achievements.config.AppConfig;

@Slf4j
@SpringBootApplication
@ConfigurationPropertiesScan // Сканирует и регистрирует классы с @ConfigurationProperties
//@EnableConfigurationProperties(AppConfig.class)
public class EmployeeAchievementsApplication {
    public static void main(String[] args) {
		SpringApplication.run(EmployeeAchievementsApplication.class, args);
	}
}
