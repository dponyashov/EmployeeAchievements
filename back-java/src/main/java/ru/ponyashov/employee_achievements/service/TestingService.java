package ru.ponyashov.employee_achievements.service;

import org.springframework.transaction.annotation.Transactional;
import ru.ponyashov.employee_achievements.dto.testing.TestingDtos;

import java.util.List;

public interface TestingService {
    @Transactional(readOnly = true)
    List<TestingDtos.TestSectionResponseDto> getSections();

    @Transactional
    TestingDtos.TestSectionResponseDto createSection(TestingDtos.TestSectionRequestDto dto);

    @Transactional
    TestingDtos.TestSectionResponseDto updateSection(Long id, TestingDtos.TestSectionRequestDto dto);

    @Transactional
    boolean deleteSection(Long id);

    @Transactional
    List<TestingDtos.TestSummaryDto> getTestsBySection(Long sectionId);

    @Transactional(readOnly = true)
    TestingDtos.TestAdminDetailDto getTestAdminDetail(Long testId);

    @Transactional
    TestingDtos.TestAdminDetailDto saveTest(Long testId, TestingDtos.TestUpsertRequestDto dto);

    @Transactional
    boolean deleteTest(Long testId);

    // =========================================================================
// 3. ПРОХОЖДЕНИЕ ТЕСТИРОВАНИЯ СОТРУДНИКОМ
// =========================================================================

    @Transactional
    TestingDtos.TestAttemptSessionDto startOrResumeAttempt(Long testId, boolean training);

    @Transactional
    TestingDtos.TestAttemptSessionDto submitAnswer(Long attemptId, TestingDtos.SubmitAnswerRequestDto dto);

    @Transactional
    TestingDtos.TestAttemptSessionDto finishAttempt(Long attemptId, boolean expiredByTimer);

    // =========================================================================
// 4. КОНТРОЛЬ ТЕСТИРОВАНИЯ И СТАТИСТИКА
// =========================================================================
    @Transactional
    TestingDtos.TestControlOverviewDto getTestControlOverview(Long testId);

    @Transactional
    List getEmployeeAttemptsProtocols(Long testId, Long profileId);

    @Transactional
    boolean grantExtraAttempt(Long testId, Long profileId);
}
