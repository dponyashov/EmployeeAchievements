package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.request.RoleRequestDto;
import ru.ponyashov.employee_achievements.dto.response.RoleResponseDto;

import java.util.Collection;

public interface RoleService {

    Collection<RoleResponseDto> findAll();
    RoleResponseDto findById(Long id);
    RoleResponseDto save(Long id, RoleRequestDto dto);
    RoleResponseDto save(RoleRequestDto dto);
    boolean delete(Long id);
}
