package ru.ponyashov.employee_achievements.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;

import java.io.IOException;
import java.util.List;

public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

//        Map<String, Object> body = Map.of(
//                "status", HttpServletResponse.SC_UNAUTHORIZED,
//                "error", "Unauthorized",
//                "message", "Неверный, отсутствующий или истекший JWT токен",
//                "path", request.getServletPath()
//        );

        ResponseMessageDto body = ResponseMessageDto.builder()
                .message(List.of("Неверный, отсутствующий или истекший JWT токен"))
                .statusCode(HttpStatus.UNAUTHORIZED.value())
                .statusText(HttpStatus.UNAUTHORIZED.name())
                .build();

        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }
}