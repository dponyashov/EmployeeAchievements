package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.ponyashov.employee_achievements.entity.RoomBookingEntity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface RoomBookingRepository extends JpaRepository<RoomBookingEntity, Long> {

    @Query("""
        SELECT b FROM RoomBookingEntity b
        JOIN FETCH b.room r
        JOIN FETCH b.author a
        WHERE b.bookingDate = :date
          AND (:roomId IS NULL OR r.id = :roomId)
        ORDER BY b.startTime ASC, r.id ASC
    """)
    List<RoomBookingEntity> findByDateAndOptionalRoom(
            @Param("date") LocalDate date,
            @Param("roomId") Long roomId
    );

    @Query("""
        SELECT b FROM RoomBookingEntity b
        JOIN FETCH b.author a
        WHERE b.room.id = :roomId
          AND b.bookingDate = :date
          AND (:excludeId IS NULL OR b.id <> :excludeId)
          AND b.startTime < :endTime
          AND b.endTime > :startTime
    """)
    List<RoomBookingEntity> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );
}
