package ru.ponyashov.employee_achievements.controller.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.RoleRequestDto;
import ru.ponyashov.employee_achievements.dto.response.RoleResponseDto;
import ru.ponyashov.employee_achievements.service.RoleService;

import java.util.Collection;

@RestController
@Tag(name = "Авторизация - роли", description = "Управление учетными записями пользователей")
@RequiredArgsConstructor
@RequestMapping("/role")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {
    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<Collection<RoleResponseDto>> getAll(){
        return ResponseEntity.ok(roleService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<RoleResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(roleService.findById(id));
    }

    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleResponseDto> create(@Valid @RequestBody RoleRequestDto newDto){
        return ResponseEntity.ok(roleService.save(newDto));
    }

    @PatchMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleResponseDto> update(@PathVariable("id") Long id, @Valid @RequestBody RoleRequestDto newDto){
        return ResponseEntity.ok(roleService.save(id, newDto));
    }

    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        return ResponseEntity.ok(roleService.delete(id));
    }
}
