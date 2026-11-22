package ru.ponyashov.employee_achievements.controller.testing;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.ponyashov.employee_achievements.dto.testing.TestingDtos.*;
import ru.ponyashov.employee_achievements.service.TestingService;

import java.util.List;

@RestController
@Tag(name = "Тестирование сотрудников", description = "Разделы, тесты, прохождение и контроль")
@RequiredArgsConstructor
//@RequestMapping("/testing")
public class TestingController {

    private final TestingService testingService;

    // --- Разделы тестирования ---
    @GetMapping("/sections")
    @PreAuthorize("hasAnyRole('TEST', 'TEST_CONTROL', 'TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<List<TestSectionResponseDto>> getSections() {
        return ResponseEntity.ok(testingService.getSections());
    }

    @PostMapping("/sections")
    @PreAuthorize("hasAnyRole('TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestSectionResponseDto> createSection(@Valid @RequestBody TestSectionRequestDto dto) {
        return ResponseEntity.ok(testingService.createSection(dto));
    }

    @PatchMapping("/sections/{id}")
    @PreAuthorize("hasAnyRole('TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestSectionResponseDto> updateSection(
            @PathVariable("id") Long id,
            @Valid @RequestBody TestSectionRequestDto dto
    ) {
        return ResponseEntity.ok(testingService.updateSection(id, dto));
    }

    @DeleteMapping("/sections/{id}")
    @PreAuthorize("hasAnyRole('TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<Boolean> deleteSection(@PathVariable("id") Long id) {
        return ResponseEntity.ok(testingService.deleteSection(id));
    }

    // --- Тесты раздела и редактор тестов ---
    @GetMapping("/sections/{sectionId}/tests")
    @PreAuthorize("hasAnyRole('TEST', 'TEST_CONTROL', 'TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<List<TestSummaryDto>> getTestsBySection(@PathVariable("sectionId") Long sectionId) {
        return ResponseEntity.ok(testingService.getTestsBySection(sectionId));
    }

    @GetMapping("/tests/{testId}/admin")
    @PreAuthorize("hasAnyRole('TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestAdminDetailDto> getTestAdminDetail(@PathVariable("testId") Long testId) {
        return ResponseEntity.ok(testingService.getTestAdminDetail(testId));
    }

    @PostMapping("/tests")
    @PreAuthorize("hasAnyRole('TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestAdminDetailDto> createTest(@Valid @RequestBody TestUpsertRequestDto dto) {
        return ResponseEntity.ok(testingService.saveTest(null, dto));
    }

    @PatchMapping("/tests/{testId}")
    @PreAuthorize("hasAnyRole('TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestAdminDetailDto> updateTest(
            @PathVariable("testId") Long testId,
            @Valid @RequestBody TestUpsertRequestDto dto
    ) {
        return ResponseEntity.ok(testingService.saveTest(testId, dto));
    }

    @DeleteMapping("/tests/{testId}")
    @PreAuthorize("hasAnyRole('TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<Boolean> deleteTest(@PathVariable("testId") Long testId) {
        return ResponseEntity.ok(testingService.deleteTest(testId));
    }

    // --- Прохождение тестирования ---
    @PostMapping("/tests/{testId}/start")
    @PreAuthorize("hasAnyRole('TEST', 'TEST_CONTROL', 'TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestAttemptSessionDto> startTest(@PathVariable("testId") Long testId) {
        return ResponseEntity.ok(testingService.startOrResumeAttempt(testId));
    }

    @PostMapping("/attempts/{attemptId}/answer")
    @PreAuthorize("hasAnyRole('TEST', 'TEST_CONTROL', 'TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestAttemptSessionDto> submitAnswer(
            @PathVariable("attemptId") Long attemptId,
            @RequestBody SubmitAnswerRequestDto dto
    ) {
        return ResponseEntity.ok(testingService.submitAnswer(attemptId, dto));
    }

    @PostMapping("/attempts/{attemptId}/finish")
    @PreAuthorize("hasAnyRole('TEST', 'TEST_CONTROL', 'TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestAttemptSessionDto> finishAttempt(
            @PathVariable("attemptId") Long attemptId,
            @RequestParam(name = "expired", defaultValue = "false") boolean expired
    ) {
        return ResponseEntity.ok(testingService.finishAttempt(attemptId, expired));
    }

    // --- Контроль тестирования и статистика ---
    @GetMapping("/tests/{testId}/control")
    @PreAuthorize("hasAnyRole('TEST_CONTROL', 'TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<TestControlOverviewDto> getControlOverview(@PathVariable("testId") Long testId) {
        return ResponseEntity.ok(testingService.getTestControlOverview(testId));
    }

    @GetMapping("/tests/{testId}/control/employees/{profileId}")
    @PreAuthorize("hasAnyRole('TEST_CONTROL', 'TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<List<AttemptProtocolDto>> getEmployeeProtocols(
            @PathVariable("testId") Long testId,
            @PathVariable("profileId") Long profileId
    ) {
        return ResponseEntity.ok(testingService.getEmployeeAttemptsProtocols(testId, profileId));
    }

    @PostMapping("/tests/{testId}/control/employees/{profileId}/grant")
    @PreAuthorize("hasAnyRole('TEST_CONTROL', 'TEST_ADMIN', 'ADMIN')")
    public ResponseEntity<Boolean> grantExtraAttempt(
            @PathVariable("testId") Long testId,
            @PathVariable("profileId") Long profileId
    ) {
        return ResponseEntity.ok(testingService.grantExtraAttempt(testId, profileId));
    }
}