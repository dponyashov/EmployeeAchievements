package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.TaskQueryRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskQueryResponseDto;
import ru.ponyashov.employee_achievements.entity.TaskQueryEntity;
import ru.ponyashov.employee_achievements.mapper.TaskMapper;
import ru.ponyashov.employee_achievements.mapper.TaskQueryMapper;
import ru.ponyashov.employee_achievements.repository.TaskQueryRepository;
import ru.ponyashov.employee_achievements.repository.TaskRepository;
import ru.ponyashov.employee_achievements.service.TaskQueryService;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskQueryServiceImpl implements TaskQueryService {

    private final TaskQueryRepository taskQueryRepository;
    private final TaskRepository taskRepository;

    @Override
    public Collection<TaskQueryResponseDto> findAllByTaskId(Long taskId) {
        return taskQueryRepository.findAllByTaskId(taskId).stream()
                .map(TaskQueryMapper::entityToDto)
                .toList();
    }

    @Override
    public TaskQueryResponseDto save(Long taskId, TaskQueryRequestDto dto) {

        var existQuery = findTaskQueryEntityByTaskIdAndName(taskId, dto.getName());
        if(existQuery != null){
            throw new RuntimeException("Запрос уже добавлен в список к этой задаче");
        }

        var task = taskRepository.findById(taskId).stream().findFirst()
                .orElseThrow(() -> new RuntimeException(String.format("Задачи c id %s не существует", taskId)));

        TaskQueryEntity item = TaskQueryMapper.dtoToEntity(dto);
        item.setTask(task);

        return TaskQueryMapper.entityToDto(taskQueryRepository.save(item));
    }

    @Override
    public boolean delete(Long id) {
        taskQueryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(String.format("Запрос с id %s НЕ существует", id)));
        taskQueryRepository.deleteById(id);
        return true;
    }

    @Override
    public boolean deleteByTaskIdAndName(Long taskId, String name) {
        var existQuery = findTaskQueryEntityByTaskIdAndName(taskId, name);
        if(existQuery == null){
            throw new RuntimeException("Запрос не существует в спискк к этой задаче");
        }
        taskQueryRepository.deleteById(existQuery.getId());
        return true;
    }

    private TaskQueryEntity findTaskQueryEntityByTaskIdAndName(Long taskId, String name){
        return taskQueryRepository.findAllByTaskIdAndName(taskId, name).stream()
                .findFirst()
                .orElse(null);
    }
}
