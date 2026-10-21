package ru.ponyashov.employee_achievements.mapper;

import ru.ponyashov.employee_achievements.dto.request.ProfileRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ProfileResponseDto;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;

public class ProfileMapper {

    public static ProfileEntity dtoToEntity(ProfileResponseDto dto){
        return ProfileEntity.builder()
                .id(dto.getId())
                .email(dto.getEmail())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .department(dto.getDepartment() != null ? DepartmentMapper.dtoToEntity(dto.getDepartment()) : null)
                .position(dto.getPosition() != null ? PositionMapper.dtoToEntity(dto.getPosition()) : null)
//                .tasks(dto.getTasks() != null ? dto.getTasks().stream().map(TaskMapper::dtoToEntity).toList() : null)
                .build();
    }

    public static ProfileEntity dtoToEntity(ProfileRequestDto dto){
        return ProfileEntity.builder()
                .email(dto.getEmail())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .build();
    }

    public static ProfileResponseDto entityToDto(ProfileEntity entity){
        return ProfileResponseDto.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .department(entity.getDepartment() != null ? DepartmentMapper.entityToDto(entity.getDepartment()) : null)
                .position(entity.getPosition() != null ? PositionMapper.entityToDto(entity.getPosition()) : null)
//                .tasks(entity.getTasks() != null ? entity.getTasks().stream().map(TaskMapper::entityToDto).toList() : null)
                .build();
    }
}
