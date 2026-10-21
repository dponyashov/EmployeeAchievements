package ru.ponyashov.employee_achievements.controller.directory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.DepartmentRequestDto;
import ru.ponyashov.employee_achievements.dto.response.DepartmentResponseDto;
import ru.ponyashov.employee_achievements.service.DepartmentService;

import java.util.Collection;

@RestController
@Tag(name = "Справочники - отделы", description = "Управление справочниками")
@RequiredArgsConstructor
@RequestMapping("/department")
@PreAuthorize("hasRole('SERVICE')")
public class DepartmentController {
    private final DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Collection<DepartmentResponseDto>> getAll(){
        return ResponseEntity.ok(departmentService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DepartmentResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(departmentService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<DepartmentResponseDto> create(@RequestBody DepartmentRequestDto newDto){
        return ResponseEntity.ok(departmentService.save(newDto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<DepartmentResponseDto> update(@PathVariable("id") Long id, @RequestBody DepartmentRequestDto newDto){
        return ResponseEntity.ok(departmentService.save(id, newDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        return ResponseEntity.ok(departmentService.delete(id));
    }
}
