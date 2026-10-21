package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.request.ServiceRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ServiceResponseDto;
import ru.ponyashov.employee_achievements.entity.ServiceEntity;

import java.util.Collection;

public interface ServiceService {
    Collection<ServiceResponseDto> findAll();
    ServiceResponseDto findById(Long id);
    ServiceEntity findEntityById(Long id);
    ServiceResponseDto save(Long id, ServiceRequestDto dto);
    ServiceResponseDto save(ServiceRequestDto dto);
    boolean delete(Long id);
}
