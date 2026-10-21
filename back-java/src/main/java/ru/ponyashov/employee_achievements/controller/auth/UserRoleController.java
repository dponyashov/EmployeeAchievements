package ru.ponyashov.employee_achievements.controller.auth;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;
import ru.ponyashov.employee_achievements.dto.response.RoleResponseDto;
import ru.ponyashov.employee_achievements.service.UserService;

import java.util.Collection;

@RestController
@Tag(name = "Авторизация - пользовательские роли", description = "Управление учетными записями пользователей")
@RequiredArgsConstructor
@RequestMapping("/user/{userId}/roles")
@PreAuthorize("hasRole('ADMIN')")
public class UserRoleController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Collection<RoleResponseDto>> getAllRoles(@PathVariable("userId") Long userId){
        return ResponseEntity.ok(userService.findAllRolesByUserId(userId));
    }

    @PostMapping("/{roleId}/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseMessageDto> addRole(@PathVariable("userId") Long userId,
                                                      @PathVariable("roleId") Long roleId){
        return ResponseEntity.ok(userService.addRoleByUser(userId, roleId));
    }

    @DeleteMapping("/{roleId}/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseMessageDto> deleteRole(@PathVariable("userId") Long userId,
                                        @PathVariable("roleId") Long roleId){
        return ResponseEntity.ok(userService.deleteRoleByUser(userId, roleId));
    }
}
