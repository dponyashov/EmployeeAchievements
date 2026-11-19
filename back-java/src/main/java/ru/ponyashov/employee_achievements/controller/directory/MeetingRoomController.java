package ru.ponyashov.employee_achievements.controller.directory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.request.MeetingRoomRequestDto;
import ru.ponyashov.employee_achievements.dto.response.MeetingRoomResponseDto;
import ru.ponyashov.employee_achievements.service.MeetingRoomService;

import java.util.List;

@RestController
@Tag(name = "Помещения для совещаний", description = "Управление списком переговорных комнат")
@RequiredArgsConstructor
@RequestMapping("/room")
public class MeetingRoomController {

    private final MeetingRoomService roomService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MeetingRoomResponseDto>> getAll(
            @RequestParam(name = "onlyActive", defaultValue = "false") boolean onlyActive
    ) {
        return ResponseEntity.ok(roomService.findAll(onlyActive));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MeetingRoomResponseDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(roomService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SERVICE', 'DEPARTMENT_ALL')")
    public ResponseEntity<MeetingRoomResponseDto> create(@Valid @RequestBody MeetingRoomRequestDto dto) {
        return ResponseEntity.ok(roomService.create(dto));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SERVICE', 'DEPARTMENT_ALL')")
    public ResponseEntity<MeetingRoomResponseDto> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody MeetingRoomRequestDto dto
    ) {
        return ResponseEntity.ok(roomService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SERVICE', 'DEPARTMENT_ALL')")
    public ResponseEntity<Boolean> delete(@PathVariable("id") Long id) {
        return ResponseEntity.ok(roomService.delete(id));
    }
}
