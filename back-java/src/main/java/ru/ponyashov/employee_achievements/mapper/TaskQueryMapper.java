package ru.ponyashov.employee_achievements.mapper;


import ru.ponyashov.employee_achievements.dto.request.TaskQueryRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskQueryResponseDto;
import ru.ponyashov.employee_achievements.entity.TaskQueryEntity;

public class TaskQueryMapper {
    public static TaskQueryEntity dtoToEntity(TaskQueryResponseDto dto) {
        return TaskQueryEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .build();
    }

    public static TaskQueryEntity dtoToEntity(TaskQueryRequestDto dto) {
        return TaskQueryEntity.builder()
                .name(dto.getName())
                .build();
    }

    public static TaskQueryResponseDto entityToDto(TaskQueryEntity entity) {
        return TaskQueryResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }
}
