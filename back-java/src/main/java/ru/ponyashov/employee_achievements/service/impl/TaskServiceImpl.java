package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.TaskRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskResponseDto;
import ru.ponyashov.employee_achievements.entity.TaskEntity;
import ru.ponyashov.employee_achievements.entity.UserEntity;
import ru.ponyashov.employee_achievements.mapper.TaskMapper;
import ru.ponyashov.employee_achievements.repository.TaskRepository;
import ru.ponyashov.employee_achievements.service.*;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserService userService;
    private final ProfileService profileService;
    private final ServiceService serviceService;
    private final ComponentService componentService;

    @Override
    public Collection<TaskResponseDto> findAll() {
        return taskRepository.findAll().stream()
                .map(TaskMapper::entityToDto)
                .toList();
    }

    @Override
    public Collection<TaskResponseDto> getAllByProfileId(Long profileId) {
        return taskRepository.findAllByProfileId(profileId).stream()
                .map(TaskMapper::entityToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponseDto> findAll(Specification<TaskEntity> spec, Pageable pageable) {
        // 1. Делаем запрос в БД с учетом фильтров, сортировки и пагинации
        Page<TaskEntity> entityPage = taskRepository.findAll(spec, pageable);

        // 2. Трансформируем страницу сущностей в страницу DTO
        return entityPage.map(TaskMapper::entityToDto);
    }
    @Override
    public TaskResponseDto findById(Long id) {
        var itemEntity = findEntityById(id);
        return TaskMapper.entityToDto(itemEntity);
    }

    @Override
    public TaskResponseDto save(Long id, TaskRequestDto dto) {
        var oldItem = findEntityById(id);

        oldItem.setTitle(dto.getTitle() != null ? dto.getTitle() : oldItem.getTitle() );
        oldItem.setDescription(dto.getDescription() != null ? dto.getDescription() : oldItem.getDescription() );
        oldItem.setYear(dto.getYear() != null ? dto.getYear() : oldItem.getYear() );
        oldItem.setMonth(dto.getMonth() != null ? dto.getMonth() : oldItem.getMonth() );
//        oldItem.setEnterDate(dto.getEnterDate() != null ? dto.getEnterDate() : oldItem.getEnterDate() );
//        oldItem.setEnterTime(dto.getEnterTime() != null ? dto.getEnterTime() : oldItem.getEnterTime() );
        if(dto.getProfileId() != null){
            var profile = profileService.findEntityById(dto.getProfileId());
            oldItem.setProfile(profile);
        }
        if(dto.getServiceId() != null){
            var service = serviceService.findEntityById(dto.getServiceId());
            oldItem.setService(service);
        }
        if(dto.getComponentId() != null){
            var component = componentService.findEntityById(dto.getComponentId());
            oldItem.setComponent(component);
        }

        return saveItem(oldItem);
    }

    @Override
    public TaskResponseDto save(TaskRequestDto dto) {

        var newItem = TaskMapper.dtoToEntity(dto);

        newItem.setEnterTime(LocalTime.now());
        newItem.setEnterDate(LocalDate.now());

        if(dto.getProfileId() != null){
            var profile = profileService.findEntityById(dto.getProfileId());
            newItem.setProfile(profile);
        }
        if(dto.getServiceId() != null){
            var service = serviceService.findEntityById(dto.getServiceId());
            newItem.setService(service);
        }
        if(dto.getComponentId() != null) {
            var component = componentService.findEntityById(dto.getComponentId());
            newItem.setComponent(component);
        }
        var currentUser = getCurrentUser();
        newItem.setAuthor( currentUser != null ? currentUser.getProfile() : null);

        return saveItem(newItem);
    }

    @Override
    public boolean delete(Long id) {
        findEntityById(id);
        taskRepository.deleteById(id);
        return true;
    }

    private TaskEntity findEntityById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Задача с id %s не найден", id)));
    }

    private TaskResponseDto saveItem(TaskEntity item) {

        var savedItem = taskRepository.save(item);
        return TaskMapper.entityToDto(savedItem);
    }

    // Получить весь объект UserDetails (или вашу кастомную сущность, если вы её туда положили)
    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String userName = authentication.getName();
            return userService.findByUsername(userName).orElse(null);

//            Object principal = authentication.getPrincipal();
//            if (principal instanceof UserEntity) {
//                return (UserEntity) principal;
//            }
        }
        return null;
    }
}
