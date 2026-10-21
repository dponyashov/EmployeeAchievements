package ru.ponyashov.employee_achievements.mapper;

import ru.ponyashov.employee_achievements.dto.response.DepartmentResponseDto;
import ru.ponyashov.employee_achievements.entity.DepartmentEntity;

public class DepartmentMapper {
    public static DepartmentEntity dtoToEntity(DepartmentResponseDto dto) {
        return DepartmentEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .build();
    }

    public static DepartmentResponseDto entityToDto(DepartmentEntity entity) {
        return DepartmentResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }
}
