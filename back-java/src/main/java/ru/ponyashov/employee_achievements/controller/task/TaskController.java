package ru.ponyashov.employee_achievements.controller.task;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.TaskRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskResponseDto;
import ru.ponyashov.employee_achievements.service.TaskService;

import java.util.Collection;

@Slf4j
@RestController
@Tag(name = "Задачи", description = "Работа с задачами")
@RequiredArgsConstructor
//@RequestMapping("/task")
public class TaskController {
    private final TaskService taskService;

    @GetMapping
//    @PreAuthorize("hasRole('ADMIN')")
    @PreAuthorize("hasAnyRole('SUPERVISOR')")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Collection<TaskResponseDto>> getAll(){
        return ResponseEntity.ok(taskService.findAll());
    }

    @GetMapping("/{profileId}/profile")
//    @PreAuthorize("hasRole('ADMIN')")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'USER')")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Collection<TaskResponseDto>> getAllByProfileId(@PathVariable("profileId") Long profileId){
        return ResponseEntity.ok(taskService.getAllByProfileId(profileId));
    }

    @GetMapping("/{userId}/user")
//    @PreAuthorize("hasRole('ADMIN')")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'USER')")
//    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Collection<TaskResponseDto>> getAllByUserId(@PathVariable("userId") Long userId){
        return ResponseEntity.ok(taskService.getAllByUserId(userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'USER')")
    public ResponseEntity<TaskResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(taskService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'USER')")
    public ResponseEntity<TaskResponseDto> create(@Valid @RequestBody TaskRequestDto newDto){

        log.info(newDto.toString());

        return ResponseEntity.ok(taskService.save(newDto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'USER')")
    public ResponseEntity<TaskResponseDto> update(@PathVariable("id") Long id, @Valid @RequestBody TaskRequestDto newDto){

        log.info(newDto.toString());

        return ResponseEntity.ok(taskService.save(id, newDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'USER')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        return ResponseEntity.ok(taskService.delete(id));
    }
}
