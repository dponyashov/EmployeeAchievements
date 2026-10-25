package ru.ponyashov.employee_achievements.controller.directory;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.ProfileRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ProfileResponseDto;
import ru.ponyashov.employee_achievements.service.ProfileService;

import java.util.Collection;

@RestController
@Tag(name = "Справочники - профили", description = "Управление справочниками")
@RequiredArgsConstructor
@RequestMapping("/profile")
@PreAuthorize("hasRole('SERVICE')")
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Collection<ProfileResponseDto>> getAll(){
        return ResponseEntity.ok(profileService.findAll());
    }

    @GetMapping("/{deptId}/department")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Collection<ProfileResponseDto>> getAllByDepId(@PathVariable("deptId") Long deptId){
        return ResponseEntity.ok(profileService.findAllByDept(deptId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(profileService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<ProfileResponseDto> create(@RequestBody ProfileRequestDto newDto){
        return ResponseEntity.ok(profileService.save(newDto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<ProfileResponseDto> update(@PathVariable("id") Long id, @RequestBody ProfileRequestDto newDto){
        return ResponseEntity.ok(profileService.save(id, newDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SERVICE')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id){
        return ResponseEntity.ok(profileService.delete(id));
    }
}
