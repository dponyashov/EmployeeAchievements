package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.RoleRequestDto;
import ru.ponyashov.employee_achievements.dto.response.RoleResponseDto;
import ru.ponyashov.employee_achievements.entity.RoleEntity;
import ru.ponyashov.employee_achievements.mapper.RoleMapper;
import ru.ponyashov.employee_achievements.repository.RoleRepository;
import ru.ponyashov.employee_achievements.service.RoleService;

import java.util.Collection;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    public Collection<RoleResponseDto> findAll() {
        return roleRepository.findAll().stream()
                .map(RoleMapper::entityToDto)
                .toList();
    }

    @Override
    public RoleResponseDto findById(Long id) {
        var itemEntity = findEntityById(id);
        return RoleMapper.entityToDto(itemEntity);
    }

    @Override
    public RoleResponseDto save(Long id, RoleRequestDto dto) {
        var itemsInDB = roleRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()) {
            var itemInDB = itemsInDB.stream().filter(item -> !Objects.equals(item.getId(), id)).findFirst();
            if (itemInDB.isPresent()) {
                throw new RuntimeException(String.format("Роль с таким названием уже существует id %s", itemInDB.get().getId()));
            }
        }

        var oldItem = findEntityById(id);
        oldItem.setName(dto.getName() != null ? dto.getName() : oldItem.getName() );
        oldItem.setDescription(dto.getDescription() != null ? dto.getDescription() : oldItem.getDescription() );
        return saveItem(oldItem);
    }

    @Override
    public RoleResponseDto save(RoleRequestDto dto) {
        var itemsInDB = roleRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()){
            throw  new RuntimeException(String.format("Роль с таким названием уже существует id %s",
                    itemsInDB.stream().findFirst().get().getId()
            ));
        }

        var newItem = RoleEntity.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        return saveItem(newItem);
    }

    @Override
    public boolean delete(Long id) {
        findEntityById(id);
        roleRepository.deleteById(id);
        return true;
    }

    private RoleEntity findEntityById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Роль с id %s не найдена", id)));
    }

    private RoleResponseDto saveItem(RoleEntity item) {

        var savedItem = roleRepository.save(item);
        return RoleMapper.entityToDto(savedItem);
    }
}
