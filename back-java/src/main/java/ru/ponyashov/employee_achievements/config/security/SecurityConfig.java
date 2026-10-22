package ru.ponyashov.employee_achievements.config.security;

import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import ru.ponyashov.employee_achievements.config.AppConfig;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity  //чтобы закрывать отдельные метода по ролям
@RequiredArgsConstructor
public class SecurityConfig {

    private final AppConfig appConfig;
//    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> {
                    CorsConfigurationSource source = request -> {
                        CorsConfiguration config = new CorsConfiguration();
                        config.setAllowCredentials(true);
                        config.setAllowedOrigins(
                                List.of(appConfig.frontUrl(),
                                        "http://localhost:5173",
                                        "https://localhost:5173"));
                        config.setAllowedMethods(
                                List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
                        config.setAllowedHeaders(
                                List.of("Accept",
                                        "Accept-Language",
                                        "Content-Language",
                                        "Content-Type",
                                        "Access-Control-Allow-Credentials",
                                        "Access-Control-Allow-Headers",
                                        "Access-Control-Allow-Origin",
                                        "Authorization")
                        );
                        return config;
                    };
                    c.configurationSource(source);
                })
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
//Когда нужен свой фильтр и свой principal >>>
//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
//Когда нужен свой фильтр и свой principal <<<
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )


                // Включаем поддержку JWT Resource Server
//                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

//                чтобы иметь возможность обрабатывать роли
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                        // РЕГИСТРАЦИЯ ОБРАБОТЧИКОВ ОШИБОК:
                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                        .accessDeniedHandler(new CustomAccessDeniedHandler())
                );

        return http.build();
    }

//    // 2. СОЗДАЕМ НАСТРОЙКИ CORS
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//
//        // Укажите адрес вашего фронтенда (например, React, Angular, Vue)
//        configuration.setAllowedOrigins(List.of(appConfig.frontUrl()));
//
//        // Разрешаем основные HTTP-методы
//        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
//
//        // ВАЖНО ДЛЯ OAUTH2: Обязательно разрешаем заголовок Authorization и Content-Type
//        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
//
//        // Разрешаем отправку кук и credentials (если требуется)
//        configuration.setAllowCredentials(true);
//
//        // Применяем эти правила ко всем эндпоинтам приложения
//        UrlCorsConfigurationSource source = new UrlCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }

    // Для обработки ролей в токене
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // Указываем имя клейма в JWT, где лежат роли (например, "roles" или "authorities")
        authoritiesConverter.setAuthoritiesClaimName("roles");
        // Задаем префикс, чтобы ROLE_ADMIN превращался в GrantedAuthority с именем ROLE_ADMIN
//        authoritiesConverter.setAuthorityPrefix("ROLE_");
        authoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return authenticationConverter;
    }

    // Декодер для проверки подписи JWT (например, если используется симметричный ключ)
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(
                Keys.hmacShaKeyFor(appConfig.jwt().atSecretKey().getBytes(StandardCharsets.UTF_8))
        ).build();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}