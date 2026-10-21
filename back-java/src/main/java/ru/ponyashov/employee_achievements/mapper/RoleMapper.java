package ru.ponyashov.employee_achievements.mapper;

import ru.ponyashov.employee_achievements.dto.response.RoleResponseDto;
import ru.ponyashov.employee_achievements.entity.RoleEntity;

public class RoleMapper {
    public static RoleEntity dtoToEntity(RoleResponseDto dto) {
        return RoleEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }

    public static RoleResponseDto entityToDto(RoleEntity entity) {
        return RoleResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }
}
