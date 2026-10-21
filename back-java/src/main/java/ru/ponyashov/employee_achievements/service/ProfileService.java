package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.request.ProfileRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ProfileResponseDto;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;

import java.util.Collection;

public interface ProfileService {

    Collection<ProfileResponseDto> findAll();
    ProfileResponseDto findById(Long id);
    ProfileResponseDto findByEmail(String email);
    ProfileEntity findEntityById(Long id);
    ProfileResponseDto save(Long id, ProfileRequestDto dto);
    ProfileResponseDto save(ProfileRequestDto dto);
    boolean delete(Long id);
}
