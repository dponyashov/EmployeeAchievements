package ru.ponyashov.employee_achievements.controller.task;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.TaskQueryRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;
import ru.ponyashov.employee_achievements.service.TaskQueryService;

import java.util.List;

@RestController
@Tag(name = "Задачи - запросы", description = "Работа с запросами к задачам")
@RequiredArgsConstructor
@RequestMapping("/{taskId}/query")
public class TaskQueryController {
    private final TaskQueryService taskQueryService;

    @PostMapping
    public ResponseEntity<ResponseMessageDto> addQuery(
            @PathVariable("taskId")Long taskId,
            @RequestBody TaskQueryRequestDto dto){

        taskQueryService.save(taskId, dto);

        return ResponseEntity.ok(ResponseMessageDto.builder()
                        .message(List.of("Запрос добавлен"))
                        .statusText(HttpStatus.OK.name())
                        .statusCode(HttpStatus.OK.value())
                .build());
    }

    @DeleteMapping
    public ResponseEntity<ResponseMessageDto> deleteQueryByName(
            @PathVariable("taskId")Long taskId,
            @RequestBody TaskQueryRequestDto dto){

        taskQueryService.deleteByTaskIdAndName(taskId, dto.getName());

        return ResponseEntity.ok(ResponseMessageDto.builder()
                .message(List.of("Запрос удален"))
                .statusText(HttpStatus.OK.name())
                .statusCode(HttpStatus.OK.value())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseMessageDto> deleteQueryById(
            @PathVariable("id")Long id){

        taskQueryService.delete(id);

        return ResponseEntity.ok(ResponseMessageDto.builder()
                .message(List.of("Запрос удален"))
                .statusText(HttpStatus.OK.name())
                .statusCode(HttpStatus.OK.value())
                .build());
    }
}
