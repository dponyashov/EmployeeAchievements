package ru.ponyashov.employee_achievements.mapper;

import ru.ponyashov.employee_achievements.dto.response.PositionResponseDto;
import ru.ponyashov.employee_achievements.entity.PositionEntity;

public class PositionMapper {
    public static PositionEntity dtoToEntity(PositionResponseDto dto) {
        return PositionEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .build();
    }

    public static PositionResponseDto entityToDto(PositionEntity entity) {
        return PositionResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }
}
