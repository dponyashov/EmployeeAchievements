package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ponyashov.employee_achievements.dto.request.RoomBookingRequestDto;
import ru.ponyashov.employee_achievements.dto.response.RoomBookingResponseDto;
import ru.ponyashov.employee_achievements.entity.MeetingRoomEntity;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;
import ru.ponyashov.employee_achievements.entity.RoomBookingEntity;
import ru.ponyashov.employee_achievements.repository.RoomBookingRepository;
import ru.ponyashov.employee_achievements.service.MeetingRoomService;
import ru.ponyashov.employee_achievements.service.RoomBookingService;
import ru.ponyashov.employee_achievements.service.UserService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomBookingServiceImpl implements RoomBookingService {

    private final RoomBookingRepository bookingRepository;
    private final MeetingRoomService roomService;
    private final UserService userService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional(readOnly = true)
    @Override
    public List<RoomBookingResponseDto> findByDate(LocalDate date, Long roomId) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return bookingRepository.findByDateAndOptionalRoom(targetDate, roomId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    @Override
    public RoomBookingResponseDto create(RoomBookingRequestDto dto) {
        validateTimeAndConflicts(dto.getRoomId(), dto.getBookingDate(), dto.getStartTime(), dto.getEndTime(), null);

        MeetingRoomEntity room = roomService.getEntity(dto.getRoomId());
        if (Boolean.FALSE.equals(room.getIsActive())) {
            throw new RuntimeException("Помещение «" + room.getName() + "» закрыто для бронирования");
        }

        var currentUser = userService.getCurrentUser();
        if (currentUser == null || currentUser.getProfile() == null) {
            throw new RuntimeException("У текущего пользователя не заполнен профиль сотрудника");
        }

        RoomBookingEntity entity = RoomBookingEntity.builder()
                .room(room)
                .author(currentUser.getProfile())
                .title(dto.getTitle().trim())
                .description(dto.getDescription())
                .bookingDate(dto.getBookingDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .enterDate(LocalDate.now())
                .enterTime(LocalTime.now())
                .build();

        return toDto(bookingRepository.save(entity));
    }

    @Transactional
    @Override
    public RoomBookingResponseDto update(Long id, RoomBookingRequestDto dto) {
        RoomBookingEntity existing = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Бронирование с id=" + id + " не найдено"));

        checkCanModify(existing);

        Long targetRoomId = dto.getRoomId() != null ? dto.getRoomId() : existing.getRoom().getId();
        LocalDate targetDate = dto.getBookingDate() != null ? dto.getBookingDate() : existing.getBookingDate();
        LocalTime targetStart = dto.getStartTime() != null ? dto.getStartTime() : existing.getStartTime();
        LocalTime targetEnd = dto.getEndTime() != null ? dto.getEndTime() : existing.getEndTime();

        validateTimeAndConflicts(targetRoomId, targetDate, targetStart, targetEnd, id);

        if (dto.getRoomId() != null) {
            MeetingRoomEntity room = roomService.getEntity(dto.getRoomId());
            if (Boolean.FALSE.equals(room.getIsActive())) {
                throw new RuntimeException("Помещение «" + room.getName() + "» закрыто для бронирования");
            }
            existing.setRoom(room);
        }
        if (dto.getTitle() != null) existing.setTitle(dto.getTitle().trim());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        existing.setBookingDate(targetDate);
        existing.setStartTime(targetStart);
        existing.setEndTime(targetEnd);

        return toDto(bookingRepository.save(existing));
    }

    @Transactional
    @Override
    public boolean delete(Long id) {
        RoomBookingEntity existing = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Бронирование с id=" + id + " не найдено"));

        checkCanModify(existing);
        bookingRepository.delete(existing);
        return true;
    }

    private void validateTimeAndConflicts(Long roomId, LocalDate date, LocalTime start, LocalTime end, Long excludeId) {
        if (!end.isAfter(start)) {
            throw new RuntimeException("Время окончания должно быть строго больше времени начала");
        }

        List<RoomBookingEntity> conflicts = bookingRepository.findOverlappingBookings(
                roomId, date, start, end, excludeId
        );

        if (!conflicts.isEmpty()) {
            RoomBookingEntity first = conflicts.get(0);
            String authorName = first.getAuthor().getLastName() + " " + first.getAuthor().getFirstName();
            throw new RuntimeException(String.format(
                    "Помещение уже занято с %s до %s (Тема: «%s», организатор: %s)",
                    first.getStartTime().format(TIME_FMT),
                    first.getEndTime().format(TIME_FMT),
                    first.getTitle(),
                    authorName
            ));
        }
    }

    private void checkCanModify(RoomBookingEntity booking) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isPrivileged = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_SUPERVISOR")
                        || a.getAuthority().equals("ROLE_DEPARTMENT_ALL"));

        if (isPrivileged) return;

        var currentUser = userService.getCurrentUser();
        Long currentProfileId = (currentUser != null && currentUser.getProfile() != null)
                ? currentUser.getProfile().getId()
                : null;

        if (currentProfileId == null || !currentProfileId.equals(booking.getAuthor().getId())) {
            throw new RuntimeException("Изменять или отменять бронь может только её автор или администратор");
        }
    }

    private RoomBookingResponseDto toDto(RoomBookingEntity b) {
        ProfileEntity author = b.getAuthor();
        String fullName = (author.getLastName() != null ? author.getLastName() : "") + " "
                + (author.getFirstName() != null ? author.getFirstName() : "");
        return RoomBookingResponseDto.builder()
                .id(b.getId())
                .roomId(b.getRoom().getId())
                .roomName(b.getRoom().getName())
                .authorId(author.getId())
                .authorUserId(author.getUser() != null ? author.getUser().getId() : null)
                .authorFullName(fullName.trim())
                .title(b.getTitle())
                .description(b.getDescription())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .build();
    }
}
