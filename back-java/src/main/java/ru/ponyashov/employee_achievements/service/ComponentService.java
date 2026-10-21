package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.request.ComponentRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ComponentResponseDto;
import ru.ponyashov.employee_achievements.entity.ComponentEntity;

import java.util.Collection;

public interface ComponentService {
    Collection<ComponentResponseDto> findAll();
    ComponentResponseDto findById(Long id);
    ComponentEntity findEntityById(Long id);
    ComponentResponseDto save(Long id, ComponentRequestDto dto);
    ComponentResponseDto save(ComponentRequestDto dto);
    boolean delete(Long id);
}
