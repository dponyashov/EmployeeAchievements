package ru.ponyashov.employee_achievements.controller.directory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.ServiceRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ServiceResponseDto;
import ru.ponyashov.employee_achievements.service.ServiceService;

import java.util.Collection;
import java.util.List;

@RestController
@Tag(name = "Справочники - услуги", description = "Управление справочниками")
@RequiredArgsConstructor
@RequestMapping("/service")
@PreAuthorize("isAuthenticated()")
public class ServiceController {
    private final ServiceService serviceService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Collection<ServiceResponseDto>> getAll(){
        return ResponseEntity.ok(serviceService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ServiceResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(serviceService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<ServiceResponseDto> create(@RequestBody ServiceRequestDto newDto){
        return ResponseEntity.ok(serviceService.save(newDto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<ServiceResponseDto> update(@PathVariable("id") Long id, @RequestBody ServiceRequestDto newDto){
        return ResponseEntity.ok(serviceService.save(id, newDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        return ResponseEntity.ok(serviceService.delete(id));
    }
}
