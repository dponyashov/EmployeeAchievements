package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.PositionRequestDto;
import ru.ponyashov.employee_achievements.dto.response.PositionResponseDto;
import ru.ponyashov.employee_achievements.entity.PositionEntity;
import ru.ponyashov.employee_achievements.mapper.PositionMapper;
import ru.ponyashov.employee_achievements.repository.PositionRepository;
import ru.ponyashov.employee_achievements.service.PositionService;

import java.util.Collection;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;

    @Override
    public Collection<PositionResponseDto> findAll() {
        return positionRepository.findAll().stream()
                .map(PositionMapper::entityToDto)
                .toList();
    }

    @Override
    public PositionResponseDto findById(Long id) {
        var itemEntity = findEntityById(id);
        return PositionMapper.entityToDto(itemEntity);
    }

    @Override
    public PositionResponseDto save(Long id, PositionRequestDto dto) {

        var itemsInDB = positionRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()) {
            var itemInDB = itemsInDB.stream().filter(item -> !Objects.equals(item.getId(), id)).findFirst();
            if (itemInDB.isPresent()) {
                throw new RuntimeException(String.format("Должность с таким названием уже существует id %s", itemInDB.get().getId()));
            }
        }

        var oldItem = findEntityById(id);
        oldItem.setName(dto.getName());
        return saveItem(oldItem);
    }

    @Override
    public PositionResponseDto save(PositionRequestDto dto) {
        var itemsInDB = positionRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()){
            throw  new RuntimeException(String.format("Должность с таким названием уже существует id %s",
                    itemsInDB.stream().findFirst().get().getId()
            ));
        }

        var newItem = PositionEntity.builder()
                .name(dto.getName())
                .build();
        return saveItem(newItem);
    }

    @Override
    public boolean delete(Long id) {
        findEntityById(id);
        positionRepository.deleteById(id);
        return true;
    }

    private PositionEntity findEntityById(Long id) {
        return positionRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Должность с id %s не найдена", id)));
    }

    private PositionResponseDto saveItem(PositionEntity item) {

        var savedItem = positionRepository.save(item);
        return PositionMapper.entityToDto(savedItem);
    }
}
