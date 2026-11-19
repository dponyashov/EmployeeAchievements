package ru.ponyashov.employee_achievements.controller.booking;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.RoomBookingRequestDto;
import ru.ponyashov.employee_achievements.dto.response.RoomBookingResponseDto;
import ru.ponyashov.employee_achievements.service.RoomBookingService;

import java.time.LocalDate;
import java.util.List;

@RestController
@Tag(name = "Бронирование помещений", description = "Расписание и бронирование переговорных")
@RequiredArgsConstructor
//@RequestMapping("/booking")
public class RoomBookingController {

    private final RoomBookingService bookingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERVISOR', 'DEPARTMENT_ALL')")
    public ResponseEntity<List<RoomBookingResponseDto>> getByDate(
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(name = "roomId", required = false) Long roomId
    ) {
        return ResponseEntity.ok(bookingService.findByDate(date, roomId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERVISOR', 'DEPARTMENT_ALL')")
    public ResponseEntity<RoomBookingResponseDto> create(@Valid @RequestBody RoomBookingRequestDto dto) {
        return ResponseEntity.ok(bookingService.create(dto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERVISOR', 'DEPARTMENT_ALL')")
    public ResponseEntity<RoomBookingResponseDto> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody RoomBookingRequestDto dto
    ) {
        return ResponseEntity.ok(bookingService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPERVISOR', 'DEPARTMENT_ALL')")
    public ResponseEntity<Boolean> delete(@PathVariable("id") Long id) {
        return ResponseEntity.ok(bookingService.delete(id));
    }
}
