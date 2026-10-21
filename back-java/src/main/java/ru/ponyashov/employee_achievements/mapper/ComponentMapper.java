package ru.ponyashov.employee_achievements.mapper;

import ru.ponyashov.employee_achievements.dto.response.ComponentResponseDto;
import ru.ponyashov.employee_achievements.entity.ComponentEntity;

public class ComponentMapper {
    public static ComponentEntity dtoToEntity(ComponentResponseDto dto) {
        return ComponentEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .build();
    }

    public static ComponentResponseDto entityToDto(ComponentEntity entity) {
        return ComponentResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }
}
