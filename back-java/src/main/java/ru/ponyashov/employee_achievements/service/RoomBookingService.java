package ru.ponyashov.employee_achievements.service;

import org.springframework.transaction.annotation.Transactional;
import ru.ponyashov.employee_achievements.dto.request.RoomBookingRequestDto;
import ru.ponyashov.employee_achievements.dto.response.RoomBookingResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface RoomBookingService {
    List<RoomBookingResponseDto> findByDate(LocalDate date, Long roomId);

    RoomBookingResponseDto create(RoomBookingRequestDto dto);

    RoomBookingResponseDto update(Long id, RoomBookingRequestDto dto);

    boolean delete(Long id);
}
