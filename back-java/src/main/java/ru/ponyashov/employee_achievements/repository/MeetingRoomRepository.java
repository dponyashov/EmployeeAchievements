package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ponyashov.employee_achievements.entity.MeetingRoomEntity;

import java.util.List;

public interface MeetingRoomRepository extends JpaRepository<MeetingRoomEntity, Long> {
    List<MeetingRoomEntity> findAllByOrderByIdAsc();
    List<MeetingRoomEntity> findAllByIsActiveTrueOrderByIdAsc();
}
