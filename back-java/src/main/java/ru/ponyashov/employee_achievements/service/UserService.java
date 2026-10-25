package ru.ponyashov.employee_achievements.service;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.userdetails.UserDetailsService;
import ru.ponyashov.employee_achievements.dto.request.PasswordChangeRequestDto;
import ru.ponyashov.employee_achievements.dto.request.RegistryRequestDto;
import ru.ponyashov.employee_achievements.dto.request.UserRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;
import ru.ponyashov.employee_achievements.dto.response.RoleResponseDto;
import ru.ponyashov.employee_achievements.dto.response.UserResponseDto;
import ru.ponyashov.employee_achievements.entity.UserEntity;

import java.util.Collection;
import java.util.Optional;

public interface UserService extends UserDetailsService {
    Collection<UserResponseDto> findAll();
    UserResponseDto findById(Long id);
    Optional<UserEntity> findByUsername(String username);
    UserResponseDto save(Long id, UserRequestDto dto);
    UserResponseDto chengePaswword(Long id, PasswordChangeRequestDto dto);
    UserResponseDto save(RegistryRequestDto dto);
    boolean delete(Long id);

    Collection<RoleResponseDto> findAllRolesByUserId(Long userId);
    ResponseMessageDto addRoleByUser(Long userId, Long roleId);
    ResponseMessageDto deleteRoleByUser(Long userId, Long roleId);
}
