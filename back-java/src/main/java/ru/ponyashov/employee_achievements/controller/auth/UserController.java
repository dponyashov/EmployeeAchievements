package ru.ponyashov.employee_achievements.controller.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.PasswordChangeRequestDto;
import ru.ponyashov.employee_achievements.dto.request.UserRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ProfileResponseDto;
import ru.ponyashov.employee_achievements.dto.response.UserResponseDto;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;
import ru.ponyashov.employee_achievements.service.ProfileService;
import ru.ponyashov.employee_achievements.service.UserService;

import java.util.Collection;
import java.util.Optional;

@RestController
@Tag(name = "Авторизация - пользователи", description = "Управление учетными записями пользователей")
@RequiredArgsConstructor
@RequestMapping("/user")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private final UserService userService;
    private final ProfileService profileService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Collection<UserResponseDto>> getAll(){
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> getById(@PathVariable("id") Long id){
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/{id}/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponseDto> getProfileByUserId(@PathVariable("id") Long userId){
        return ResponseEntity.ok(profileService.findByUserId(userId));
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<UserResponseDto> update(@PathVariable("id") Long id, @Valid @RequestBody PasswordChangeRequestDto newDto){
        return ResponseEntity.ok(userService.chengePaswword(id, newDto));
    }

//    @PostMapping
//    public ResponseEntity<UserResponseDto> create(@RequestBody UserRequestDto newDto){
//        return ResponseEntity.ok(userService.save(newDto));
//    }
//
//    @PatchMapping("/{id}")
//    public ResponseEntity<UserResponseDto> update(@PathVariable("id") Long id, @RequestBody UserRequestDto newDto){
//        return ResponseEntity.ok(userService.save(id, newDto));
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> delete(@PathVariable("id") Long id){
//        return ResponseEntity.ok(userService.delete(id));
//    }
}
