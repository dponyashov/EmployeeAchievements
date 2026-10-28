package ru.ponyashov.employee_achievements.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import ru.ponyashov.employee_achievements.dto.request.TaskRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskResponseDto;
import ru.ponyashov.employee_achievements.entity.TaskEntity;

import java.util.Collection;

public interface TaskService {
    Collection<TaskResponseDto> findAll();
    Page<TaskResponseDto> findAll(Specification<TaskEntity> spec, Pageable pageable);
    TaskResponseDto findById(Long id);
    TaskResponseDto save(Long id, TaskRequestDto dto);
    TaskResponseDto save(TaskRequestDto dto);
    boolean delete(Long id);

    Collection<TaskResponseDto> getAllByUserId(Long userId);
    Collection<TaskResponseDto> getAllByProfileId(Long profileId);
}