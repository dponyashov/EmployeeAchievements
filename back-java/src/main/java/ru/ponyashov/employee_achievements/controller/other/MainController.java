package ru.ponyashov.employee_achievements.controller.other;


import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;

import java.util.List;

@RestController
@Tag(name = "Стартовая страница", description = "Основной контроллер")
//@RequestMapping("/")
public class MainController {

    @GetMapping("/hello")
//    @PreAuthorize("isAuthenticated()") // Теперь пустит любого пользователя с валидным JWT
    @PreAuthorize("permitAll()") // Разрешает доступ без проверки ролей на уровне метода
    public ResponseEntity<ResponseMessageDto> helo(){
        return ResponseEntity.ok(ResponseMessageDto.builder()
                .message(List.of("Hello from MainController"))
                .statusText(HttpStatus.OK.name())
                .statusCode(HttpStatus.OK.value())
                .build());
    }
}
