package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.request.TaskQueryRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskQueryResponseDto;

import java.util.Collection;

public interface TaskQueryService {
    Collection<TaskQueryResponseDto> findAllByTaskId(Long taskId);
    TaskQueryResponseDto save(Long taskId, TaskQueryRequestDto dto);
    boolean delete(Long id);
    boolean deleteByTaskIdAndName(Long taskId, String name);
}
