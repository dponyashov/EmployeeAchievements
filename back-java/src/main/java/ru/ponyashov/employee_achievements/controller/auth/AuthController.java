package ru.ponyashov.employee_achievements.controller.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.config.AppConfig;
import ru.ponyashov.employee_achievements.dto.AuthResultDto;
import ru.ponyashov.employee_achievements.dto.request.LoginRequestDto;
import ru.ponyashov.employee_achievements.dto.request.RegistryRequestDto;
import ru.ponyashov.employee_achievements.dto.response.LoginResponseDto;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;
import ru.ponyashov.employee_achievements.service.AuthService;

import java.time.Duration;

@RestController
@Tag(name = "Авторизация", description = "Управление учетными записями пользователей")
@RequiredArgsConstructor
//@RequestMapping("/auth")
public class AuthController {

    private final String COOKIE_NAME = "ea_refresh_token";

    private final AuthService authService;
    private final AppConfig appConfig;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginDto, HttpServletResponse response){
        AuthResultDto result = authService.authenticate(loginDto);

        // Устанавливаем refresh token в HttpOnly cookie
        ResponseCookie refreshCookie = ResponseCookie.from(COOKIE_NAME, result.getRefreshToken())
                .httpOnly(true)
                .secure(true) // true для HTTPS в Production
                .path("/api/auth/refresh") // Ограничиваем путь отправки куки
                .maxAge(Duration.ofMillis(appConfig.jwt().rtExpiration()))
                .sameSite("Strict") // или "Lax" в зависимости от фронтенда
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(LoginResponseDto.builder()
                        .tokenAccess(result.getAccessToken())
                        .user(result.getUser())
                .build()
        );
    }

    @PostMapping("/registry")
    public ResponseEntity<LoginResponseDto> registry(@Valid @RequestBody RegistryRequestDto newDto, HttpServletResponse response){

        AuthResultDto result = authService.registry(newDto);

        // Устанавливаем refresh token в HttpOnly cookie
        ResponseCookie refreshCookie = ResponseCookie.from(COOKIE_NAME, result.getRefreshToken())
                .httpOnly(true)
                .secure(true) // true для HTTPS в Production
                .path("/api/auth/refresh") // Ограничиваем путь отправки куки
                .maxAge(Duration.ofMillis(appConfig.jwt().rtExpiration()))
                .sameSite("Strict") // или "Lax" в зависимости от фронтенда
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(LoginResponseDto.builder()
                    .tokenAccess(result.getAccessToken())
                    .user(result.getUser())
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(
            @CookieValue(name = COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {

        AuthResultDto newTokens = authService.refreshAccessToken(refreshToken);

        ResponseCookie refreshCookie = ResponseCookie.from(COOKIE_NAME, newTokens.getRefreshToken())
                .httpOnly(true)
                .secure(true) // true для HTTPS в Production
                .path("/api/auth/refresh") // Ограничиваем путь отправки куки
                .maxAge(Duration.ofMillis(appConfig.jwt().rtExpiration()))
                .sameSite("Strict") // или "Lax" в зависимости от фронтенда
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(LoginResponseDto.builder()
                .tokenAccess(newTokens.getAccessToken())
                .user(newTokens.getUser())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseMessageDto> logout(HttpServletResponse response) {
        // Затираем куку на клиенте
        ResponseCookie deleteCookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .path("/api/auth/refresh")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

        return ResponseEntity.ok(authService.logout());
    }
}
