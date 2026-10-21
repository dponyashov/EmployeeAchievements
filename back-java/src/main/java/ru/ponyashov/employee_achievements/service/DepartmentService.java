package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.request.DepartmentRequestDto;
import ru.ponyashov.employee_achievements.dto.response.DepartmentResponseDto;
import ru.ponyashov.employee_achievements.entity.DepartmentEntity;

import java.util.Collection;

public interface DepartmentService {
    Collection<DepartmentResponseDto> findAll();
    DepartmentResponseDto findById(Long id);
    DepartmentEntity findEntityById(Long id);
    DepartmentResponseDto save(Long id, DepartmentRequestDto dto);
    DepartmentResponseDto save(DepartmentRequestDto dto);
    boolean delete(Long id);
}
