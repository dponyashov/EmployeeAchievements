package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.ComponentRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ComponentResponseDto;
import ru.ponyashov.employee_achievements.entity.ComponentEntity;
import ru.ponyashov.employee_achievements.mapper.ComponentMapper;
import ru.ponyashov.employee_achievements.repository.ComponentRepository;
import ru.ponyashov.employee_achievements.service.ComponentService;

import java.util.Collection;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ComponentServiceImpl implements ComponentService {

    private final ComponentRepository componentRepository;

    @Override
    public Collection<ComponentResponseDto> findAll() {
        return componentRepository.findAll().stream()
                .map(ComponentMapper::entityToDto)
                .toList();
    }

    @Override
    public ComponentResponseDto findById(Long id) {
        var itemEntity = findEntityById(id);
        return ComponentMapper.entityToDto(itemEntity);
    }

    @Override
    public ComponentResponseDto save(Long id, ComponentRequestDto dto) {
        var itemsInDB = componentRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()) {
            var itemInDB = itemsInDB.stream().filter(item -> !Objects.equals(item.getId(), id)).findFirst();
            if (itemInDB.isPresent()) {
                throw new RuntimeException(String.format("Компонент с таким названием уже существует id %s", itemInDB.get().getId()));
            }
        }

        var oldItem = findEntityById(id);
        oldItem.setName(dto.getName());
        return saveItem(oldItem);
    }

    @Override
    public ComponentResponseDto save(ComponentRequestDto dto) {

        var itemsInDB = componentRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()){
            throw  new RuntimeException(String.format("Компонент с таким названием уже существует id %s",
                    itemsInDB.stream().findFirst().get().getId()
            ));
        }

        var newItem = ComponentEntity.builder()
                .name(dto.getName())
                .build();
        return saveItem(newItem);
    }

    @Override
    public boolean delete(Long id) {
        findEntityById(id);
        componentRepository.deleteById(id);
        return true;
    }

    @Override
    public ComponentEntity findEntityById(Long id) {
        return componentRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Компонент с id %s не найден", id)));
    }

    private ComponentResponseDto saveItem(ComponentEntity item) {

        var savedItem = componentRepository.save(item);
        return ComponentMapper.entityToDto(savedItem);
    }
}
