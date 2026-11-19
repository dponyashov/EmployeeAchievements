package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.request.MeetingRoomRequestDto;
import ru.ponyashov.employee_achievements.dto.response.MeetingRoomResponseDto;
import ru.ponyashov.employee_achievements.entity.MeetingRoomEntity;

import java.util.List;

public interface MeetingRoomService {
    List<MeetingRoomResponseDto> findAll(boolean onlyActive);

    MeetingRoomResponseDto findById(Long id);

    MeetingRoomResponseDto create(MeetingRoomRequestDto dto);

    MeetingRoomResponseDto update(Long id, MeetingRoomRequestDto dto);

    boolean delete(Long id);

    MeetingRoomEntity getEntity(Long id);
}
