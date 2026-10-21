package ru.ponyashov.employee_achievements.mapper;

import ru.ponyashov.employee_achievements.dto.response.ServiceResponseDto;
import ru.ponyashov.employee_achievements.entity.ServiceEntity;

public class ServiceMapper {

    public static ServiceEntity dtoToEntity(ServiceResponseDto dto) {
        return ServiceEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .build();
    }

    public static ServiceResponseDto entityToDto(ServiceEntity entity) {
        return ServiceResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }
}
