package ru.ponyashov.employee_achievements.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
@Log4j2
public class ExceptionController {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ResponseMessageDto> exceptionHandler(RuntimeException exception){
        log.error("{} : {}", HttpStatus.BAD_REQUEST, exception.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseMessageDto.builder()
                        .message(List.of(exception.getMessage()))
                        .statusText(HttpStatus.BAD_REQUEST.name())
                        .statusCode(HttpStatus.BAD_REQUEST.value())
                        .build()
        );
    }

//    Красивая обработка ошибок валидации
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseMessageDto> handleValidationExceptions(MethodArgumentNotValidException ex) {
//        Map<String, String> errors = new HashMap<>();
//        ex.getBindingResult().getAllErrors().forEach((error) => {
//                String fieldName = ((FieldError) error).getField();
//        String errorMessage = error.getDefaultMessage();
//        errors.put(fieldName, errorMessage);
//        });

        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.add(String.format("%s: '%s'", fieldName, errorMessage));
        });

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ResponseMessageDto.builder()
                        .message(errors)
                        .statusText(HttpStatus.BAD_REQUEST.name())
                        .statusCode(HttpStatus.BAD_REQUEST.value())
                        .build()
        );
    }

    // Перехватываем ошибку нехватки прав от @PreAuthorize
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseMessageDto> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {

        ResponseMessageDto body = ResponseMessageDto.builder()
                .message(List.of("У вас нет прав для доступа к этому ресурсу (необходима другая роль)"))
                .statusCode(HttpStatus.FORBIDDEN.value())
                .statusText(HttpStatus.FORBIDDEN.name())
                .build();

        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }
}
