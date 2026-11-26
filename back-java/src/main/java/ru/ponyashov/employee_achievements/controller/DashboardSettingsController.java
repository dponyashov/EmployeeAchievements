package ru.ponyashov.employee_achievements.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.DashboardSettingsDto;
import ru.ponyashov.employee_achievements.entity.UserDashboardSettingsEntity;
import ru.ponyashov.employee_achievements.repository.UserDashboardSettingsRepository;
import ru.ponyashov.employee_achievements.service.UserService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/dashboard/settings")
@RequiredArgsConstructor
public class DashboardSettingsController {

    private static final List<String> DEFAULT_TILES = List.of(
            "achievements", "employees", "bookings", "testing", "news", "admin"
    );

    private final UserDashboardSettingsRepository repository;
    private final UserService userService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<DashboardSettingsDto> getSettings() {
        Long userId = userService.getCurrentUser().getId();
        return repository.findById(userId)
                .map(entity -> ResponseEntity.ok(toDto(entity)))
                .orElseGet(() -> ResponseEntity.ok(DashboardSettingsDto.builder()
                        .columnsCount(4)
                        .rowsCount(3)
                        .tiles(DEFAULT_TILES)
                        .build()));
    }

    @PutMapping
    @Transactional
    public ResponseEntity<DashboardSettingsDto> saveSettings(@RequestBody DashboardSettingsDto dto) {
        Long userId = userService.getCurrentUser().getId();

        int cols = dto.getColumnsCount() != null
                ? Math.min(6, Math.max(1, dto.getColumnsCount()))
                : 4;
        int rows = dto.getRowsCount() != null
                ? Math.min(6, Math.max(1, dto.getRowsCount()))
                : 3;
        List<String> tiles = dto.getTiles() != null ? dto.getTiles() : DEFAULT_TILES;

        String json;
        try {
            json = objectMapper.writeValueAsString(tiles);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка сериализации списка плиток рабочего стола", e);
        }

        UserDashboardSettingsEntity entity = repository.findById(userId)
                .orElseGet(() -> UserDashboardSettingsEntity.builder().userId(userId).build());

        entity.setColumnsCount(cols);
        entity.setRowsCount(rows);
        entity.setTilesJson(json);
        entity.setUpdatedAt(LocalDateTime.now());

        UserDashboardSettingsEntity saved = repository.save(entity);
        return ResponseEntity.ok(toDto(saved));
    }

    private DashboardSettingsDto toDto(UserDashboardSettingsEntity entity) {
        List<String> tiles;
        try {
            tiles = objectMapper.readValue(entity.getTilesJson(), new TypeReference<>() {});
        } catch (Exception e) {
            tiles = DEFAULT_TILES;
        }
        return DashboardSettingsDto.builder()
                .columnsCount(entity.getColumnsCount())
                .rowsCount(entity.getRowsCount())
                .tiles(tiles)
                .build();
    }
}
