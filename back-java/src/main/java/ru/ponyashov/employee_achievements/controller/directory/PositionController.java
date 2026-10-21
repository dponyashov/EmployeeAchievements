package ru.ponyashov.employee_achievements.controller.directory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.PositionRequestDto;
import ru.ponyashov.employee_achievements.dto.response.PositionResponseDto;
import ru.ponyashov.employee_achievements.service.PositionService;

import java.util.Collection;

@RestController
@Tag(name = "Справочники - должности", description = "Управление справочниками")
@RequiredArgsConstructor
@RequestMapping("/position")
@PreAuthorize("hasRole('SERVICE')")
public class PositionController {
    private final PositionService positionService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Collection<PositionResponseDto>> getAll(){
        return ResponseEntity.ok(positionService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PositionResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(positionService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<PositionResponseDto> create(@RequestBody PositionRequestDto newDto){
        return ResponseEntity.ok(positionService.save(newDto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<PositionResponseDto> update(@PathVariable("id") Long id, @RequestBody PositionRequestDto newDto){
        return ResponseEntity.ok(positionService.save(id, newDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        return ResponseEntity.ok(positionService.delete(id));
    }
}
