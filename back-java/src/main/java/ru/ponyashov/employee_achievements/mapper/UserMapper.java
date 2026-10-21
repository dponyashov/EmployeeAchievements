package ru.ponyashov.employee_achievements.mapper;

import ru.ponyashov.employee_achievements.dto.request.ProfileRequestDto;
import ru.ponyashov.employee_achievements.dto.request.UserRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ProfileResponseDto;
import ru.ponyashov.employee_achievements.dto.response.UserResponseDto;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;
import ru.ponyashov.employee_achievements.entity.UserEntity;

import java.util.List;

public class UserMapper {

    public static UserEntity dtoToEntity(UserResponseDto dto){
        return UserEntity.builder()
                .id(dto.getId())
                .userName(dto.getUserName())
                .roles(dto.getRoles() != null ? dto.getRoles().stream()
                        .map(RoleMapper::dtoToEntity).toList() : List.of())
                .build();
    }

    public static UserEntity dtoToEntity(UserRequestDto dto){
        return UserEntity.builder()
                .userName(dto.getUserName())
                .password(dto.getPassword())
                .roles(List.of())
                .build();
    }

    public static UserResponseDto entityToDto(UserEntity entity){
        return UserResponseDto.builder()
                .id(entity.getId())
                .userName(entity.getUsername())
                .roles(entity.getRoles() != null ? entity.getRoles().stream()
                        .map(RoleMapper::entityToDto).toList() : List.of())
                .build();
    }
}
