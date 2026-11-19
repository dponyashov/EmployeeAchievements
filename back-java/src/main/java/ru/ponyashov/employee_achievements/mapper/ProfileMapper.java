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
                .phone(dto.getPhone())
                .department(dto.getDepartment() != null ? DepartmentMapper.dtoToEntity(dto.getDepartment()) : null)
                .position(dto.getPosition() != null ? PositionMapper.dtoToEntity(dto.getPosition()) : null)
                .build();
    }

    public static ProfileEntity dtoToEntity(ProfileRequestDto dto){
        return ProfileEntity.builder()
                .email(dto.getEmail())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phone(dto.getPhone())
                .build();
    }

    public static ProfileResponseDto entityToDto(ProfileEntity entity){
        return ProfileResponseDto.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .phone(entity.getPhone())
                .department(entity.getDepartment() != null ? DepartmentMapper.entityToDto(entity.getDepartment()) : null)
                .position(entity.getPosition() != null ? PositionMapper.entityToDto(entity.getPosition()) : null)
                .build();
    }
}
