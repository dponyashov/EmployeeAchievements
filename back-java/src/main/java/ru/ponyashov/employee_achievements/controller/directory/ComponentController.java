package ru.ponyashov.employee_achievements.controller.directory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.ComponentRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ComponentResponseDto;
import ru.ponyashov.employee_achievements.service.ComponentService;

import java.util.Collection;

@RestController
@Tag(name = "Справочники - компоненты", description = "Управление справочниками")
@RequiredArgsConstructor
@RequestMapping("/component")
@PreAuthorize("hasRole('SERVICE')")
public class ComponentController {
    private final ComponentService componentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Collection<ComponentResponseDto>> getAll(){
        return ResponseEntity.ok(componentService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComponentResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(componentService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<ComponentResponseDto> create(@RequestBody ComponentRequestDto newDto){
        return ResponseEntity.ok(componentService.save(newDto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<ComponentResponseDto> update(@PathVariable("id") Long id, @RequestBody ComponentRequestDto newDto){
        return ResponseEntity.ok(componentService.save(id, newDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        return ResponseEntity.ok(componentService.delete(id));
    }
}
