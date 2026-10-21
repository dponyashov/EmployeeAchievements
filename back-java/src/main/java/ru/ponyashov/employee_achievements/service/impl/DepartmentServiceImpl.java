package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.DepartmentRequestDto;
import ru.ponyashov.employee_achievements.dto.response.DepartmentResponseDto;
import ru.ponyashov.employee_achievements.entity.DepartmentEntity;
import ru.ponyashov.employee_achievements.mapper.DepartmentMapper;
import ru.ponyashov.employee_achievements.repository.DepartmentRepository;
import ru.ponyashov.employee_achievements.service.DepartmentService;

import java.util.Collection;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    public Collection<DepartmentResponseDto> findAll() {
        return departmentRepository.findAll().stream()
                .map(DepartmentMapper::entityToDto)
                .toList();
    }

    @Override
    public DepartmentResponseDto findById(Long id) {
        var itemEntity = findEntityById(id);
        return DepartmentMapper.entityToDto(itemEntity);
    }

    @Override
    public DepartmentResponseDto save(Long id, DepartmentRequestDto dto) {

        var itemsInDB = departmentRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()) {
            var itemInDB = itemsInDB.stream().filter(item -> !Objects.equals(item.getId(), id)).findFirst();
            if (itemInDB.isPresent()) {
                throw new RuntimeException(String.format("Отдел с таким названием уже существует id %s", itemInDB.get().getId()));
            }
        }

        var oldItem = findEntityById(id);
        oldItem.setName(dto.getName());
        return saveItem(oldItem);
    }

    @Override
    public DepartmentResponseDto save(DepartmentRequestDto dto) {
        var itemsInDB = departmentRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()){
            throw  new RuntimeException(String.format("Отдел с таким названием уже существует id %s",
                    itemsInDB.stream().findFirst().get().getId()
                    ));
        }

        var newItem = DepartmentEntity.builder()
                .name(dto.getName())
                .build();
        return saveItem(newItem);
    }

    @Override
    public boolean delete(Long id) {
        findEntityById(id);
        departmentRepository.deleteById(id);
        return true;
    }

    @Override
    public DepartmentEntity findEntityById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Отдел с id %s не найден", id)));
    }

    private DepartmentResponseDto saveItem(DepartmentEntity item) {

        var savedItem = departmentRepository.save(item);
        return DepartmentMapper.entityToDto(savedItem);
    }
}
