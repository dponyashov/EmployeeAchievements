package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.ProfileRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ProfileResponseDto;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;
import ru.ponyashov.employee_achievements.mapper.ProfileMapper;
import ru.ponyashov.employee_achievements.repository.DepartmentRepository;
import ru.ponyashov.employee_achievements.repository.PositionRepository;
import ru.ponyashov.employee_achievements.repository.ProfileRepository;
import ru.ponyashov.employee_achievements.repository.UserRepository;
import ru.ponyashov.employee_achievements.service.ProfileService;

import java.util.Collection;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final PositionRepository positionRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Override
    public Collection<ProfileResponseDto> findAll() {
        return profileRepository.findAll().stream()
                .map(ProfileMapper::entityToDto)
                .toList();
    }

    @Override
    public ProfileResponseDto findById(Long id) {
        var itemEntity = findEntityById(id);
        return ProfileMapper.entityToDto(itemEntity);
    }

    @Override
    public ProfileResponseDto findByEmail(String email) {
        var itemEntity = profileRepository.findByEmail(email).orElse(null);
        if(itemEntity != null) {
            return ProfileMapper.entityToDto(itemEntity);
        }

        return null;
    }

    @Override
    public ProfileResponseDto save(Long id, ProfileRequestDto dto) {
        var oldItem = findEntityById(id);

        oldItem.setEmail(dto.getEmail() != null ? dto.getEmail() : oldItem.getEmail() );
        oldItem.setFirstName(dto.getFirstName() != null ? dto.getFirstName() : oldItem.getFirstName() );
        oldItem.setLastName(dto.getLastName() != null ? dto.getLastName() : oldItem.getLastName() );

        if(dto.getPositionId() != null){
            var newPosition = positionRepository.findById(dto.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Указана неверная должность"));
            oldItem.setPosition(newPosition);
        }

        if(dto.getDepartmentId() != null){
            var newDepartment = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Указан неверный отдел"));
            oldItem.setDepartment(newDepartment);
        }

        return saveItem(oldItem);
    }

    @Override
    public ProfileResponseDto save(ProfileRequestDto dto) {

        if (dto.getPositionId() == null) {
            throw new RuntimeException("Должность не указана");
        }

        var position = positionRepository.findById(dto.getPositionId())
                .orElseThrow(() -> new RuntimeException("Указана неверная должность"));

        var newDepartment = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Указан неверный отдел"));

        var newItem = ProfileMapper.dtoToEntity(dto);

        newItem.setPosition(position);
        newItem.setDepartment(newDepartment);

        return saveItem(newItem);
    }

    @Override
    public boolean delete(Long id) {
        findEntityById(id);
        profileRepository.deleteById(id);
        return true;
    }

    @Override
    public ProfileEntity findEntityById(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Профиль с id %s не найден", id)));
    }

    private ProfileResponseDto saveItem(ProfileEntity item) {

        var savedItem = profileRepository.save(item);
        return ProfileMapper.entityToDto(savedItem);
    }
}
