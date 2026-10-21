package ru.ponyashov.employee_achievements.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;

import java.io.IOException;
import java.util.List;

public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

//        Map<String, Object> body = Map.of(
//                "status", HttpServletResponse.SC_FORBIDDEN,
//                "error", "Forbidden",
//                "message", "У вас нет прав для доступа к этому ресурсу (необходима другая роль)",
//                "path", request.getServletPath()
//        );

        ResponseMessageDto body = ResponseMessageDto.builder()
                .message(List.of("У вас нет прав для доступа к этому ресурсу (необходима другая роль)"))
                .statusCode(HttpStatus.FORBIDDEN.value())
                .statusText(HttpStatus.FORBIDDEN.name())
                .build();

        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }
}
