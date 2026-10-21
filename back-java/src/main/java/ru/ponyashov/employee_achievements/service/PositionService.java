package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.request.PositionRequestDto;
import ru.ponyashov.employee_achievements.dto.response.PositionResponseDto;

import java.util.Collection;

public interface PositionService {
    Collection<PositionResponseDto> findAll();
    PositionResponseDto findById(Long id);
    PositionResponseDto save(Long id, PositionRequestDto dto);
    PositionResponseDto save(PositionRequestDto dto);
    boolean delete(Long id);
}
