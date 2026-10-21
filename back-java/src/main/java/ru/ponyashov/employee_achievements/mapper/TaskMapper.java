package ru.ponyashov.employee_achievements.mapper;

import ru.ponyashov.employee_achievements.dto.request.TaskRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskResponseDto;
import ru.ponyashov.employee_achievements.entity.TaskEntity;

public class TaskMapper {

    public static TaskEntity dtoToEntity(TaskRequestDto dto) {
        return TaskEntity.builder()
                .description(dto.getDescription())
//                .enterDate(dto.getEnterDate())
//                .enterTime(dto.getEnterTime())
                .month(dto.getMonth())
                .title(dto.getTitle())
                .year(dto.getYear())
                .profile(null)
                .service(null)
                .component(null)
                .author(null)
                .build();
    }

    public static TaskEntity dtoToEntity(TaskResponseDto dto) {
        return TaskEntity.builder()
                .id(dto.getId())
                .description(dto.getDescription())
                .enterDate(dto.getEnterDate())
                .enterTime(dto.getEnterTime())
                .month(dto.getMonth())
                .title(dto.getTitle())
                .year(dto.getYear())
                .profile(ProfileMapper.dtoToEntity(dto.getProfile()))
                .service(ServiceMapper.dtoToEntity(dto.getService()))
                .component(ComponentMapper.dtoToEntity(dto.getComponent()))
                .author(ProfileMapper.dtoToEntity(dto.getAuthor()))
                .build();
    }

    public static TaskResponseDto entityToDto(TaskEntity entity) {
        return TaskResponseDto.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .enterDate(entity.getEnterDate())
                .enterTime(entity.getEnterTime())
                .month(entity.getMonth())
                .title(entity.getTitle())
                .year(entity.getYear())
                .profile(entity.getProfile() != null ? ProfileMapper.entityToDto(entity.getProfile()) : null)
                .service(entity.getService() != null ? ServiceMapper.entityToDto(entity.getService()) : null)
                .component(entity.getComponent() != null ? ComponentMapper.entityToDto(entity.getComponent()) : null)
                .author(entity.getAuthor() != null ? ProfileMapper.entityToDto(entity.getAuthor()) : null)
                .queries(entity.getQueries() != null ?
                        entity.getQueries().stream().map(TaskQueryMapper::entityToDto).toList() : null)
                .build();
    }
}
