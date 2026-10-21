package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.ServiceRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ServiceResponseDto;
import ru.ponyashov.employee_achievements.entity.ServiceEntity;
import ru.ponyashov.employee_achievements.mapper.ServiceMapper;
import ru.ponyashov.employee_achievements.repository.ServiceRepository;
import ru.ponyashov.employee_achievements.service.ServiceService;

import java.util.Collection;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;

    @Override
    public Collection<ServiceResponseDto> findAll() {
        return serviceRepository.findAll().stream()
                .map(ServiceMapper::entityToDto)
                .toList();
    }

    @Override
    public ServiceResponseDto findById(Long id) {
        var itemEntity = findEntityById(id);
        return ServiceMapper.entityToDto(itemEntity);
    }

    @Override
    public ServiceResponseDto save(Long id, ServiceRequestDto dto) {

        var itemsInDB = serviceRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()) {
            var itemInDB = itemsInDB.stream().filter(item -> !Objects.equals(item.getId(), id)).findFirst();
            if (itemInDB.isPresent()) {
                throw new RuntimeException(String.format("Услуга с таким названием уже существует id %s", itemInDB.get().getId()));
            }
        }

        var oldItem = findEntityById(id);
        oldItem.setName(dto.getName());
        return saveItem(oldItem);
    }

    @Override
    public ServiceResponseDto save(ServiceRequestDto dto) {
        var itemsInDB = serviceRepository.findAllByNameIgnoreCase(dto.getName().trim());
        if (!itemsInDB.isEmpty()){
            throw  new RuntimeException(String.format("Услуга с таким названием уже существует id %s",
                    itemsInDB.stream().findFirst().get().getId()
            ));
        }

        var newItem = ServiceEntity.builder()
                .name(dto.getName())
                .build();
        return saveItem(newItem);
    }

    @Override
    public boolean delete(Long id) {
        findEntityById(id);
        serviceRepository.deleteById(id);
        return true;
    }

    @Override
    public ServiceEntity findEntityById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Услуга с id %s не найден", id)));
    }

    private ServiceResponseDto saveItem(ServiceEntity item) {

        var savedItem = serviceRepository.save(item);
        return ServiceMapper.entityToDto(savedItem);
    }
}
