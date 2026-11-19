package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.MeetingRoomRequestDto;
import ru.ponyashov.employee_achievements.dto.response.MeetingRoomResponseDto;
import ru.ponyashov.employee_achievements.entity.MeetingRoomEntity;
import ru.ponyashov.employee_achievements.repository.MeetingRoomRepository;
import ru.ponyashov.employee_achievements.service.MeetingRoomService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingRoomServiceImpl implements MeetingRoomService {

    private final MeetingRoomRepository roomRepository;

    @Override
    public List<MeetingRoomResponseDto> findAll(boolean onlyActive) {
        List<MeetingRoomEntity> list = onlyActive
                ? roomRepository.findAllByIsActiveTrueOrderByIdAsc()
                : roomRepository.findAllByOrderByIdAsc();
        return list.stream().map(this::toDto).toList();
    }

    @Override
    public MeetingRoomResponseDto findById(Long id) {
        return toDto(getEntity(id));
    }

    @Override
    public MeetingRoomResponseDto create(MeetingRoomRequestDto dto) {
        MeetingRoomEntity entity = MeetingRoomEntity.builder()
                .name(dto.getName().trim())
                .capacity(dto.getCapacity() != null ? dto.getCapacity() : 1)
                .equipment(dto.getEquipment())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return toDto(roomRepository.save(entity));
    }

    @Override
    public MeetingRoomResponseDto update(Long id, MeetingRoomRequestDto dto) {
        MeetingRoomEntity entity = getEntity(id);
        if (dto.getName() != null) entity.setName(dto.getName().trim());
        if (dto.getCapacity() != null) entity.setCapacity(dto.getCapacity());
        if (dto.getEquipment() != null) entity.setEquipment(dto.getEquipment());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
        return toDto(roomRepository.save(entity));
    }

    @Override
    public boolean delete(Long id) {
        getEntity(id);
        roomRepository.deleteById(id);
        return true;
    }

    @Override
    public MeetingRoomEntity getEntity(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Помещение с id=" + id + " не найдено"));
    }

    private MeetingRoomResponseDto toDto(MeetingRoomEntity e) {
        return MeetingRoomResponseDto.builder()
                .id(e.getId())
                .name(e.getName())
                .capacity(e.getCapacity())
                .equipment(e.getEquipment())
                .isActive(e.getIsActive())
                .build();
    }
}
