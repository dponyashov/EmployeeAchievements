package ru.ponyashov.employee_achievements.controller.task;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.TaskRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskResponseDto;
import ru.ponyashov.employee_achievements.service.TaskService;

import java.util.Collection;

@RestController
@Tag(name = "Задачи", description = "Работа с задачами")
@RequiredArgsConstructor
//@RequestMapping("/task")
public class TaskController {
    private final TaskService taskService;

    @GetMapping
//    @PreAuthorize("hasRole('ADMIN')")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Collection<TaskResponseDto>> getAll(){
        return ResponseEntity.ok(taskService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'USER')")
    public ResponseEntity<TaskResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(taskService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TaskResponseDto> create(@RequestBody TaskRequestDto newDto){
        return ResponseEntity.ok(taskService.save(newDto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TaskResponseDto> update(@PathVariable("id") Long id, @RequestBody TaskRequestDto newDto){
        return ResponseEntity.ok(taskService.save(id, newDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        return ResponseEntity.ok(taskService.delete(id));
    }
}
