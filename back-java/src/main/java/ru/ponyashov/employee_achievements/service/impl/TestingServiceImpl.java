package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ponyashov.employee_achievements.dto.testing.TestingDtos.*;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;
import ru.ponyashov.employee_achievements.entity.testing.*;
import ru.ponyashov.employee_achievements.repository.testing.*;
import ru.ponyashov.employee_achievements.service.ProfileService;
import ru.ponyashov.employee_achievements.service.TestingService;
import ru.ponyashov.employee_achievements.service.UserService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestingServiceImpl implements TestingService {

    private final TestSectionRepository sectionRepository;
    private final TestRepository testRepository;
    private final TestAttemptRepository attemptRepository;
    private final TestExtraGrantRepository extraGrantRepository;
    private final UserService userService;
    private final ProfileService profileService;
    private final TestAttemptAnswerRepository attemptAnswerRepository;


    private boolean isTestAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEST_ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));
    }

    private ProfileEntity getCurrentProfile() {
        var user = userService.getCurrentUser();
        if (user == null || user.getProfile() == null) {
            throw new RuntimeException("У текущего пользователя не заполнен профиль сотрудника");
        }
        return user.getProfile();
    }

    // =========================================================================
    // 1. РАЗДЕЛЫ ТЕСТИРОВАНИЯ
    // =========================================================================

    @Transactional(readOnly = true)
    public List<TestSectionResponseDto> getSections() {
        boolean admin = isTestAdmin();
        List<TestSectionEntity> sections = admin
                ? sectionRepository.findAllByOrderBySortOrderAscIdAsc()
                : sectionRepository.findAllByIsActiveTrueOrderBySortOrderAscIdAsc();

        return sections.stream().map(s -> {
            int count = admin
                    ? testRepository.findAllBySectionIdOrderByIdAsc(s.getId()).size()
                    : testRepository.findAllBySectionIdAndIsHiddenFalseOrderByIdAsc(s.getId()).size();
            return TestSectionResponseDto.builder()
                    .id(s.getId())
                    .title(s.getTitle())
                    .description(s.getDescription())
                    .sortOrder(s.getSortOrder())
                    .isActive(s.getIsActive())
                    .testsCount(count)
                    .build();
        }).toList();
    }

    @Transactional
    public TestSectionResponseDto createSection(TestSectionRequestDto dto) {
        TestSectionEntity entity = TestSectionEntity.builder()
                .title(dto.getTitle().trim())
                .description(dto.getDescription())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        TestSectionEntity saved = sectionRepository.save(entity);
        return TestSectionResponseDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .sortOrder(saved.getSortOrder())
                .isActive(saved.getIsActive())
                .testsCount(0)
                .build();
    }

    @Transactional
    public TestSectionResponseDto updateSection(Long id, TestSectionRequestDto dto) {
        TestSectionEntity entity = sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Раздел тестирования не найден"));
        if (dto.getTitle() != null) entity.setTitle(dto.getTitle().trim());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getSortOrder() != null) entity.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
        TestSectionEntity saved = sectionRepository.save(entity);
        return TestSectionResponseDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .sortOrder(saved.getSortOrder())
                .isActive(saved.getIsActive())
                .testsCount(testRepository.findAllBySectionIdOrderByIdAsc(saved.getId()).size())
                .build();
    }

    @Transactional
    public boolean deleteSection(Long id) {
        sectionRepository.deleteById(id);
        return true;
    }
    // =========================================================================
    // 2. СПИСОК ТЕСТОВ РАЗДЕЛА И РЕДАКТОР ТЕСТА (ADMIN)
    // =========================================================================

    @Transactional
    @Override
    public List<TestSummaryDto> getTestsBySection(Long sectionId) {
        TestSectionEntity section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Раздел тестирования не найден"));
        if (!Boolean.TRUE.equals(section.getIsActive()) && !isTestAdmin()) {
            throw new RuntimeException("Данный раздел тестирования скрыт администратором");
        }

        boolean admin = isTestAdmin();
        ProfileEntity currentProfile = getCurrentProfile();

        List<TestEntity> tests = admin
                ? testRepository.findAllBySectionIdOrderByIdAsc(sectionId)
                : testRepository.findAllBySectionIdAndIsHiddenFalseOrderByIdAsc(sectionId);

        return tests.stream().map(t -> {
            List<TestAttemptEntity> attempts = attemptRepository
                    .findAllByTestIdAndProfileIdOrderByAttemptNumberAsc(t.getId(), currentProfile.getId())
                    .stream()
                    .filter(a -> !Boolean.TRUE.equals(a.getIsTraining()))
                    .toList();


            for (TestAttemptEntity a : attempts) {
                if ("IN_PROGRESS".equals(a.getStatus())) {
                    checkAndExpireIfNeeded(a);
                }
            }

            boolean hasInProgress = attempts.stream().anyMatch(a -> "IN_PROGRESS".equals(a.getStatus()));
            boolean hasUnusedGrant = extraGrantRepository
                    .findFirstByTestIdAndProfileIdAndIsUsedFalseOrderByIdAsc(t.getId(), currentProfile.getId())
                    .isPresent();

            boolean canStart = !Boolean.TRUE.equals(t.getIsHidden())
                    && !t.getQuestions().isEmpty()
                    && (hasInProgress || attempts.isEmpty() || hasUnusedGrant);

            Double lastScore = attempts.isEmpty()
                    ? null
                    : attempts.get(attempts.size() - 1).getScorePercent();

            return TestSummaryDto.builder()
                    .id(t.getId())
                    .sectionId(t.getSection().getId())
                    .title(t.getTitle())
                    .description(t.getDescription())
                    .questionsLimit(t.getQuestionsLimit())
                    .bankQuestionsCount(t.getQuestions().size())
                    .hasTimeLimit(t.getHasTimeLimit())
                    .timeLimitMinutes(t.getTimeLimitMinutes())
                    .isHidden(t.getIsHidden())
                    .userAttemptsCount(attempts.size())
                    .canStartNow(canStart)
                    .hasInProgressAttempt(hasInProgress)
                    .lastScorePercent(lastScore)
                    .allowTraining(Boolean.TRUE.equals(t.getAllowTraining()))
                    .passScorePercent(t.getPassScorePercent() != null ? t.getPassScorePercent() : 80)
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public TestAdminDetailDto getTestAdminDetail(Long testId) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Тест не найден"));

        List<TestQuestionUpsertDto> questions = test.getQuestions().stream().map(q -> {
            TestQuestionUpsertDto qDto = new TestQuestionUpsertDto();
            qDto.setId(q.getId());
            qDto.setQuestionText(q.getQuestionText());
            qDto.setSortOrder(q.getSortOrder());
            qDto.setOptions(q.getOptions().stream().map(o -> {
                TestOptionUpsertDto oDto = new TestOptionUpsertDto();
                oDto.setId(o.getId());
                oDto.setCode(o.getCode());
                oDto.setOptionText(o.getOptionText());
                oDto.setIsCorrect(o.getIsCorrect());
                return oDto;
            }).toList());
            return qDto;
        }).toList();

        return TestAdminDetailDto.builder()
                .id(test.getId())
                .sectionId(test.getSection().getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .questionsLimit(test.getQuestionsLimit())
                .hasTimeLimit(test.getHasTimeLimit())
                .timeLimitMinutes(test.getTimeLimitMinutes())
                .isHidden(test.getIsHidden())
                .questions(questions)
                .allowTraining(Boolean.TRUE.equals(test.getAllowTraining()))
                .passScorePercent(test.getPassScorePercent() != null ? test.getPassScorePercent() : 80)

                .build();
    }
    @Transactional
    public TestAdminDetailDto saveTest(Long testId, TestUpsertRequestDto dto) {
        validateTestQuestions(dto);

        TestEntity test;
        if (testId == null) {
            TestSectionEntity section = sectionRepository.findById(dto.getSectionId())
                    .orElseThrow(() -> new RuntimeException("Раздел тестирования не найден"));
            test = new TestEntity();
            test.setSection(section);
        } else {
            test = testRepository.findById(testId)
                    .orElseThrow(() -> new RuntimeException("Тест не найден"));
        }

        test.setTitle(dto.getTitle().trim());
        test.setDescription(dto.getDescription());
        test.setQuestionsLimit(dto.getQuestionsLimit() != null ? dto.getQuestionsLimit() : 10);
        test.setHasTimeLimit(Boolean.TRUE.equals(dto.getHasTimeLimit()));
        test.setTimeLimitMinutes(Boolean.TRUE.equals(dto.getHasTimeLimit()) ? dto.getTimeLimitMinutes() : null);
        test.setIsHidden(Boolean.TRUE.equals(dto.getIsHidden()));
        test.setAllowTraining(Boolean.TRUE.equals(dto.getAllowTraining()));
        test.setPassScorePercent(dto.getPassScorePercent() != null ? dto.getPassScorePercent() : 80);

        Map<Long, TestQuestionEntity> existingQuestionsMap = test.getQuestions().stream()
                .filter(q -> q.getId() != null)
                .collect(Collectors.toMap(TestQuestionEntity::getId, q -> q));

        List<TestQuestionEntity> updatedQuestions = new ArrayList<>();
        if (dto.getQuestions() != null) {
            int qIndex = 1;
            for (TestQuestionUpsertDto qDto : dto.getQuestions()) {
                TestQuestionEntity qEntity = (qDto.getId() != null && existingQuestionsMap.containsKey(qDto.getId()))
                        ? existingQuestionsMap.get(qDto.getId())
                        : TestQuestionEntity.builder().test(test).build();

                qEntity.setQuestionText(qDto.getQuestionText().trim());
                qEntity.setSortOrder(qDto.getSortOrder() != null ? qDto.getSortOrder() : qIndex++);

                Map<Long, TestAnswerOptionEntity> existingOptionsMap = qEntity.getOptions().stream()
                        .filter(o -> o.getId() != null)
                        .collect(Collectors.toMap(TestAnswerOptionEntity::getId, o -> o));

                List<TestAnswerOptionEntity> updatedOptions = new ArrayList<>();
                for (TestOptionUpsertDto oDto : qDto.getOptions()) {
                    TestAnswerOptionEntity oEntity = (oDto.getId() != null && existingOptionsMap.containsKey(oDto.getId()))
                            ? existingOptionsMap.get(oDto.getId())
                            : TestAnswerOptionEntity.builder().question(qEntity).build();

                    oEntity.setCode(oDto.getCode().trim().toLowerCase());
                    oEntity.setOptionText(oDto.getOptionText().trim());
                    oEntity.setIsCorrect(Boolean.TRUE.equals(oDto.getIsCorrect()));
                    updatedOptions.add(oEntity);
                }

                qEntity.getOptions().clear();
                qEntity.getOptions().addAll(updatedOptions);
                updatedQuestions.add(qEntity);
            }
        }

        test.getQuestions().clear();
        test.getQuestions().addAll(updatedQuestions);

        TestEntity saved = testRepository.save(test);
        return getTestAdminDetail(saved.getId());
    }


    @Transactional
    public boolean deleteTest(Long testId) {
        testRepository.deleteById(testId);
        return true;
    }

    private void validateTestQuestions(TestUpsertRequestDto dto) {
        if (Boolean.TRUE.equals(dto.getHasTimeLimit())
                && (dto.getTimeLimitMinutes() == null || dto.getTimeLimitMinutes() < 1)) {
            throw new RuntimeException("Укажите лимит времени в минутах (не менее 1)");
        }
        if (dto.getQuestions() == null || dto.getQuestions().isEmpty()) {
            throw new RuntimeException("Добавьте хотя бы один вопрос в тест");
        }
        for (int i = 0; i < dto.getQuestions().size(); i++) {
            TestQuestionUpsertDto q = dto.getQuestions().get(i);
            if (q.getOptions() == null || q.getOptions().size() < 2) {
                throw new RuntimeException("Вопрос №" + (i + 1) + ": добавьте минимум 2 варианта ответа");
            }
            long correctCount = q.getOptions().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .count();
            if (correctCount < 1) {
                throw new RuntimeException("Вопрос №" + (i + 1) + ": отметьте хотя бы один правильный ответ");
            }
            Set<String> codes = new HashSet<>();
            for (TestOptionUpsertDto opt : q.getOptions()) {
                String normCode = opt.getCode() != null ? opt.getCode().trim().toLowerCase() : "";
                if (normCode.isEmpty() || !codes.add(normCode)) {
                    throw new RuntimeException("Вопрос №" + (i + 1) + ": символьные коды ответов (a, b, c...) должны быть уникальными и непустыми");
                }
            }
        }
    }
    // =========================================================================
    // 3. ПРОХОЖДЕНИЕ ТЕСТИРОВАНИЯ СОТРУДНИКОМ
    // =========================================================================

    @Transactional
    @Override
    public TestAttemptSessionDto startOrResumeAttempt(Long testId, boolean training) {
        ProfileEntity profile = getCurrentProfile();
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Тест не найден"));

        if (Boolean.TRUE.equals(test.getIsHidden()) && !isTestAdmin()) {
            throw new RuntimeException("Данный тест скрыт администратором");
        }
        if (!Boolean.TRUE.equals(test.getSection().getIsActive()) && !isTestAdmin()) {
            throw new RuntimeException("Раздел данного теста скрыт администратором");
        }
        if (training && !Boolean.TRUE.equals(test.getAllowTraining())) {
            throw new RuntimeException("Обучающий режим для данного теста отключён");
        }
        if (test.getQuestions().isEmpty()) {
            throw new RuntimeException("В тесте отсутствуют вопросы");
        }

        List<TestAttemptEntity> allUserAttempts = attemptRepository
                .findAllByTestIdAndProfileIdOrderByAttemptNumberAsc(testId, profile.getId());

        // Разделяем зачётные и обучающие попытки
        List<TestAttemptEntity> previousAttempts = allUserAttempts.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsTraining()) == training)
                .toList();

        // Если есть незавершённая попытка нужного режима — возвращаем её (с проверкой таймера)
        Optional<TestAttemptEntity> inProgressOpt = previousAttempts.stream()
                .filter(a -> "IN_PROGRESS".equals(a.getStatus()))
                .findFirst();

        if (inProgressOpt.isPresent()) {
            TestAttemptEntity activeAttempt = inProgressOpt.get();
            checkAndExpireIfNeeded(activeAttempt);
            if ("IN_PROGRESS".equals(activeAttempt.getStatus())) {
                return buildSessionDto(activeAttempt);
            }
        }

        // Для зачётного режима проверяем лимит попыток (для обучающего — без ограничений)
        if (!training) {
            long completedOrExpiredCount = previousAttempts.stream()
                    .filter(a -> !"IN_PROGRESS".equals(a.getStatus()))
                    .count();
            List<TestExtraGrantEntity> unusedGrants = extraGrantRepository
                    .findAllByTestIdAndProfileIdAndIsUsedFalse(testId, profile.getId());

            if (completedOrExpiredCount > 0 && unusedGrants.isEmpty()) {
                throw new RuntimeException("Попытка прохождения теста уже использована. Для повторного прохождения обратитесь к ответственному за тестирование.");
            }

            if (completedOrExpiredCount > 0 && !unusedGrants.isEmpty()) {
                TestExtraGrantEntity grant = unusedGrants.get(0);
                grant.setIsUsed(true);
                extraGrantRepository.save(grant);
            }
        }

        List<TestQuestionEntity> pool = new ArrayList<>(test.getQuestions());
        Collections.shuffle(pool);
        int limit = Math.min(test.getQuestionsLimit(), pool.size());
        List<TestQuestionEntity> selectedQuestions = pool.subList(0, limit);

        TestAttemptEntity newAttempt = TestAttemptEntity.builder()
                .test(test)
                .profile(profile)
                .attemptNumber(training ? 0 : previousAttempts.size() + 1)
                .isTraining(training)
                .status("IN_PROGRESS")
                .startedAt(LocalDateTime.now())
                .totalQuestions(limit)
                .answeredQuestions(0)
                .correctAnswers(0)
                .scorePercent(0.0)
                .build();

        TestAttemptEntity savedAttempt = attemptRepository.save(newAttempt);

        List<TestAttemptAnswerEntity> answerEntities = new ArrayList<>();
        int order = 1;
        for (TestQuestionEntity q : selectedQuestions) {
            TestAttemptAnswerEntity ans = TestAttemptAnswerEntity.builder()
                    .attempt(savedAttempt)
                    .question(q)
                    .questionOrder(order++)
                    .isAnswered(false)
                    .isCorrect(false)
                    .build();
            answerEntities.add(ans);
        }
        attemptAnswerRepository.saveAll(answerEntities);

        return buildSessionDto(savedAttempt);
    }

    @Transactional
    public TestAttemptSessionDto submitAnswer(Long attemptId, SubmitAnswerRequestDto dto) {
        ProfileEntity profile = getCurrentProfile();
        TestAttemptEntity attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Попытка тестирования не найдена"));

        if (!attempt.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Нет доступа к чужой попытке тестирования");
        }

        checkAndExpireIfNeeded(attempt);
        if (!"IN_PROGRESS".equals(attempt.getStatus())) {
            throw new RuntimeException("Время тестирования истекло или тест уже завершён");
        }

        TestAttemptAnswerEntity targetAnswer = attemptAnswerRepository.findAllByAttemptIdOrderByQuestionOrderAscIdAsc(attempt.getId()).stream()
                .filter(a -> a.getQuestion().getId().equals(dto.getQuestionId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Вопрос не найден в текущей попытке"));

        if (Boolean.TRUE.equals(targetAnswer.getIsAnswered())) {
            throw new RuntimeException("Ответ на данный вопрос уже принят и не может быть изменён");
        }

        List<String> selected = dto.getSelectedCodes() == null
                ? List.of()
                : dto.getSelectedCodes().stream()
                .filter(Objects::nonNull)
                .map(c -> c.trim().toLowerCase())
                .distinct()
                .sorted()
                .toList();

        if (selected.isEmpty()) {
            throw new RuntimeException("Выберите хотя бы один вариант ответа перед принятием");
        }

        Set<String> correctCodes = targetAnswer.getQuestion().getOptions().stream()
                .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                .map(o -> o.getCode().trim().toLowerCase())
                .collect(Collectors.toSet());

        Set<String> userCodes = new HashSet<>(selected);
        boolean isCorrect = !correctCodes.isEmpty() && correctCodes.equals(userCodes);

        targetAnswer.setSelectedCodes(String.join(",", selected));
        targetAnswer.setIsAnswered(true);
        targetAnswer.setIsCorrect(isCorrect);
        targetAnswer.setAnsweredAt(LocalDateTime.now());

        attemptAnswerRepository.save(targetAnswer);

        recalculateAttemptStats(attempt);

//        attemptAnswerRepository.save(targetAnswer);

//        if (attempt.getAnsweredQuestions() >= attempt.getTotalQuestions()) {
//            attempt.setStatus("COMPLETED");
//            attempt.setFinishedAt(LocalDateTime.now());
//        }

        attemptRepository.save(attempt);
        return buildSessionDto(attempt);
    }

    @Transactional
    @Override
    public TestAttemptSessionDto finishAttempt(Long attemptId, boolean expiredByTimer) {
        ProfileEntity profile = getCurrentProfile();
        TestAttemptEntity attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Попытка тестирования не найдена"));

        if (!attempt.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Нет доступа к чужой попытке тестирования");
        }

        if ("IN_PROGRESS".equals(attempt.getStatus())) {
            recalculateAttemptStats(attempt);
            attempt.setStatus(expiredByTimer ? "EXPIRED" : "COMPLETED");
            attempt.setFinishedAt(LocalDateTime.now());
            attemptRepository.save(attempt);
        }

        return buildSessionDto(attempt);
    }
    private void checkAndExpireIfNeeded(TestAttemptEntity attempt) {
        if (!"IN_PROGRESS".equals(attempt.getStatus())) return;
        TestEntity test = attempt.getTest();
        if (Boolean.TRUE.equals(test.getHasTimeLimit()) && test.getTimeLimitMinutes() != null) {
            LocalDateTime deadline = attempt.getStartedAt().plusMinutes(test.getTimeLimitMinutes());
            if (LocalDateTime.now().isAfter(deadline)) {
                recalculateAttemptStats(attempt);
                attempt.setStatus("EXPIRED");
                attempt.setFinishedAt(deadline);
                attemptRepository.save(attempt);
            }
        }
    }

    private void recalculateAttemptStats(TestAttemptEntity attempt) {
        int answered = (int) attemptAnswerRepository.findAllByAttemptIdOrderByQuestionOrderAscIdAsc(attempt.getId()).stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsAnswered()))
                .count();
        int correct = (int) attemptAnswerRepository.findAllByAttemptIdOrderByQuestionOrderAscIdAsc(attempt.getId()).stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsAnswered()) && Boolean.TRUE.equals(a.getIsCorrect()))
                .count();
        int total = attempt.getTotalQuestions();
        double percent = total > 0 ? Math.round((correct * 1000.0 / total)) / 10.0 : 0.0;

        attempt.setAnsweredQuestions(answered);
        attempt.setCorrectAnswers(correct);
        attempt.setScorePercent(percent);
    }

    private TestAttemptSessionDto buildSessionDto(TestAttemptEntity attempt) {
        TestEntity test = attempt.getTest();
        Long remainingSeconds = null;

        if ("IN_PROGRESS".equals(attempt.getStatus())
                && Boolean.TRUE.equals(test.getHasTimeLimit())
                && test.getTimeLimitMinutes() != null) {
            LocalDateTime deadline = attempt.getStartedAt().plusMinutes(test.getTimeLimitMinutes());
            long diff = Duration.between(LocalDateTime.now(), deadline).getSeconds();
            remainingSeconds = Math.max(0L, diff);
        }

        List<AttemptQuestionViewDto> questionDtos = attemptAnswerRepository.findAllByAttemptIdOrderByQuestionOrderAscIdAsc(attempt.getId()).stream().map(ans -> {
            TestQuestionEntity q = ans.getQuestion();
            long correctCount = q.getOptions().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .count();

            List<String> selectedList = (ans.getSelectedCodes() == null || ans.getSelectedCodes().isBlank())
                    ? List.of()
                    : Arrays.asList(ans.getSelectedCodes().split(","));

            List<AttemptOptionViewDto> optionDtos = q.getOptions().stream()
                    .map(o -> AttemptOptionViewDto.builder()
                            .id(o.getId())
                            .code(o.getCode())
                            .optionText(o.getOptionText())
                            .build())
                    .toList();

            List<String> correctCodes = null;
            if (Boolean.TRUE.equals(ans.getIsAnswered()) || !"IN_PROGRESS".equals(attempt.getStatus())) {
                correctCodes = ans.getQuestion().getOptions().stream()
                        .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                        .map(o -> o.getCode().toLowerCase())
                        .sorted()
                        .toList();
            }

            return AttemptQuestionViewDto.builder()
                    .attemptAnswerId(ans.getId())
                    .questionId(q.getId())
                    .questionOrder(ans.getQuestionOrder())
                    .questionText(q.getQuestionText())
                    .isMultipleChoice(correctCount > 1)
                    .options(optionDtos)
                    .isAnswered(ans.getIsAnswered())
                    .selectedCodes(selectedList)
                    .answeredAt(ans.getAnsweredAt())
                    .correctCodes(correctCodes)
                    .build();
        }).toList();

        int passScore = attempt.getTest().getPassScorePercent() != null
                ? attempt.getTest().getPassScorePercent()
                : 80;
        boolean isPassed = attempt.getScorePercent() != null && attempt.getScorePercent() >= passScore;

        return TestAttemptSessionDto.builder()
                .attemptId(attempt.getId())
                .testId(test.getId())
                .testTitle(test.getTitle())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .finishedAt(attempt.getFinishedAt())
                .hasTimeLimit(test.getHasTimeLimit())
                .timeLimitMinutes(test.getTimeLimitMinutes())
                .remainingSeconds(remainingSeconds)
                .totalQuestions(attempt.getTotalQuestions())
                .answeredQuestions(attempt.getAnsweredQuestions())
                .correctAnswers(attempt.getCorrectAnswers())
                .scorePercent(attempt.getScorePercent())
                .questions(questionDtos)
                .passScorePercent(passScore)
                .isPassed(isPassed)
                .build();
    }
    // =========================================================================
    // 4. КОНТРОЛЬ ТЕСТИРОВАНИЯ И СТАТИСТИКА
    // =========================================================================

    @Transactional
    public TestControlOverviewDto getTestControlOverview(Long testId) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Тест не найден"));

        List<TestAttemptEntity> allAttempts = attemptRepository.findAllByTestIdOrderByStartedAtDesc(testId);
        for (TestAttemptEntity a : allAttempts) {
            if ("IN_PROGRESS".equals(a.getStatus())) {
                checkAndExpireIfNeeded(a);
            }
        }

        Map<Long, List<TestAttemptEntity>> byProfile = allAttempts.stream()
                .collect(Collectors.groupingBy(a -> a.getProfile().getId()));

        List<TestEmployeeControlRowDto> employeeRows = new ArrayList<>();
        for (Map.Entry<Long, List<TestAttemptEntity>> entry : byProfile.entrySet()) {
            List<TestAttemptEntity> empAttempts = entry.getValue();
            empAttempts.sort(Comparator.comparingInt(TestAttemptEntity::getAttemptNumber));

            ProfileEntity p = empAttempts.get(0).getProfile();
            TestAttemptEntity last = empAttempts.get(empAttempts.size() - 1);
            double best = empAttempts.stream()
                    .mapToDouble(TestAttemptEntity::getScorePercent)
                    .max()
                    .orElse(0.0);

            int unusedGrants = extraGrantRepository
                    .findAllByTestIdAndProfileIdAndIsUsedFalse(testId, p.getId())
                    .size();

            employeeRows.add(TestEmployeeControlRowDto.builder()
                    .profileId(p.getId())
                    .fullName((p.getLastName() + " " + p.getFirstName()).trim())
                    .departmentName(p.getDepartment() != null ? p.getDepartment().getName() : "—")
                    .positionName(p.getPosition() != null ? p.getPosition().getName() : "—")
                    .attemptsCount(empAttempts.size())
                    .unusedExtraGrantsCount(unusedGrants)
                    .bestScorePercent(best)
                    .lastScorePercent(last.getScorePercent())
                    .lastStatus(last.getStatus())
                    .lastAttemptDate(last.getFinishedAt() != null ? last.getFinishedAt() : last.getStartedAt())
                    .build());
        }

        employeeRows.sort(Comparator.comparing(TestEmployeeControlRowDto::getFullName));

        List<TestAttemptEntity> finishedAttempts = allAttempts.stream()
                .filter(a -> !"IN_PROGRESS".equals(a.getStatus()))
                .toList();

        double avgScore = finishedAttempts.isEmpty()
                ? 0.0
                : Math.round(finishedAttempts.stream()
                .mapToDouble(TestAttemptEntity::getScorePercent)
                .average()
                .orElse(0.0) * 10.0) / 10.0;

        // Подсчет статистики правильных ответов по каждому вопросу теста
        Map<Long, int[]> questionCounters = new HashMap<>();
        for (TestAttemptEntity attempt : allAttempts) {
            if ("IN_PROGRESS".equals(attempt.getStatus())) continue;
            List<TestAttemptAnswerEntity> attemptAnswers =
                    attemptAnswerRepository.findAllByAttemptIdOrderByQuestionOrderAscIdAsc(attempt.getId());
            for (TestAttemptAnswerEntity ans : attemptAnswers) {
                Long qId = ans.getQuestion().getId();
                int[] counts = questionCounters.computeIfAbsent(qId, k -> new int[2]);
                counts[0] += 1;
                if (Boolean.TRUE.equals(ans.getIsAnswered()) && Boolean.TRUE.equals(ans.getIsCorrect())) {
                    counts[1] += 1;
                }
            }
        }

        List<TestQuestionStatDto> questionStats = test.getQuestions().stream().map(q -> {
            int[] counts = questionCounters.getOrDefault(q.getId(), new int[2]);
            int asked = counts[0];
            int correct = counts[1];
            double percent = asked > 0 ? Math.round((correct * 1000.0 / asked)) / 10.0 : 0.0;

            return TestQuestionStatDto.builder()
                    .questionId(q.getId())
                    .sortOrder(q.getSortOrder())
                    .questionText(q.getQuestionText())
                    .timesAsked(asked)
                    .correctAnswersCount(correct)
                    .correctPercent(percent)
                    .build();
        }).toList();

        return TestControlOverviewDto.builder()
                .testId(test.getId())
                .testTitle(test.getTitle())
                .sectionTitle(test.getSection().getTitle())
                .questionsLimit(test.getQuestionsLimit())
                .totalParticipants(employeeRows.size())
                .completedAttemptsTotal(finishedAttempts.size())
                .averageScorePercent(avgScore)
                .employees(employeeRows)
                .questionStats(questionStats)
                .build();
    }

    @Transactional
    public List<AttemptProtocolDto> getEmployeeAttemptsProtocols(Long testId, Long profileId) {
        List<TestAttemptEntity> attempts = attemptRepository
                .findAllByTestIdAndProfileIdOrderByAttemptNumberAsc(testId, profileId);

        for (TestAttemptEntity a : attempts) {
            if ("IN_PROGRESS".equals(a.getStatus())) {
                checkAndExpireIfNeeded(a);
            }
        }

        return attempts.stream().map(this::buildProtocolDto).toList();
    }

    @Transactional
    public boolean grantExtraAttempt(Long testId, Long profileId) {
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Тест не найден"));
        ProfileEntity targetProfile = profileService.findEntityById(profileId);
        ProfileEntity curator = getCurrentProfile();

        boolean hasActive = attemptRepository
                .findFirstByTestIdAndProfileIdAndStatusOrderByIdDesc(testId, profileId, "IN_PROGRESS")
                .isPresent();
        if (hasActive) {
            throw new RuntimeException("У сотрудника уже есть активная незавершённая попытка");
        }

        boolean alreadyGranted = extraGrantRepository
                .findFirstByTestIdAndProfileIdAndIsUsedFalseOrderByIdAsc(testId, profileId)
                .isPresent();
        if (alreadyGranted) {
            throw new RuntimeException("Дополнительная попытка уже открыта для этого сотрудника");
        }

        TestExtraGrantEntity grant = TestExtraGrantEntity.builder()
                .test(test)
                .profile(targetProfile)
                .grantedBy(curator)
                .grantedAt(LocalDateTime.now())
                .isUsed(false)
                .build();
        extraGrantRepository.save(grant);
        return true;
    }

    private AttemptProtocolDto buildProtocolDto(TestAttemptEntity a) {
        ProfileEntity p = a.getProfile();
        TestEntity t = a.getTest();

        List<TestAttemptAnswerEntity> attemptAnswers =
                attemptAnswerRepository.findAllByAttemptIdOrderByQuestionOrderAscIdAsc(a.getId());

        List<AttemptProtocolAnswerDto> answerDtos = attemptAnswers.stream().map(ans -> {
            String correctCodes = ans.getQuestion().getOptions().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .map(o -> o.getCode().toLowerCase())
                    .sorted()
                    .collect(Collectors.joining(","));

            return AttemptProtocolAnswerDto.builder()
                    .questionOrder(ans.getQuestionOrder())
                    .questionText(ans.getQuestion().getQuestionText())
                    .selectedCodes(ans.getSelectedCodes() != null ? ans.getSelectedCodes() : "—")
                    .correctCodes(correctCodes)
                    .isAnswered(ans.getIsAnswered())
                    .isCorrect(ans.getIsCorrect())
                    .answeredAt(ans.getAnsweredAt())
                    .build();
        }).toList();

        int passScore = t.getPassScorePercent() != null ? t.getPassScorePercent() : 80;
        boolean isPassed = a.getScorePercent() != null && a.getScorePercent() >= passScore;

        return AttemptProtocolDto.builder()
                .attemptId(a.getId())
                .attemptNumber(a.getAttemptNumber())
                .status(a.getStatus())
                .startedAt(a.getStartedAt())
                .finishedAt(a.getFinishedAt())
                .testTitle(t.getTitle())
                .sectionTitle(t.getSection().getTitle())
                .employeeFullName((p.getLastName() + " " + p.getFirstName()).trim())
                .departmentName(p.getDepartment() != null ? p.getDepartment().getName() : "—")
                .positionName(p.getPosition() != null ? p.getPosition().getName() : "—")
                .totalQuestions(a.getTotalQuestions())
                .answeredQuestions(a.getAnsweredQuestions())
                .correctAnswers(a.getCorrectAnswers())
                .scorePercent(a.getScorePercent())
                .answers(answerDtos)
                .passScorePercent(passScore)
                .isPassed(isPassed)
                .build();
    }
}
