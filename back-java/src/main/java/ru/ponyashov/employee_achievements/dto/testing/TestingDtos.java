package ru.ponyashov.employee_achievements.dto.testing;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class TestingDtos {

    // --- Разделы тестирования ---
    @Data
    public static class TestSectionRequestDto {
        @NotBlank(message = "Название раздела обязательно")
        private String title;
        private String description;
        private Integer sortOrder = 0;
        private Boolean isActive = true;
    }

    @Data
    @Builder
    public static class TestSectionResponseDto {
        private Long id;
        private String title;
        private String description;
        private Integer sortOrder;
        private Boolean isActive;
        private Integer testsCount;
    }

    // --- Конструктор теста (Admin) ---
    @Data
    public static class TestOptionUpsertDto {
        private Long id;
        @NotBlank(message = "Символьный код ответа обязателен (a, b, c...)")
        private String code;
        @NotBlank(message = "Текст варианта ответа обязателен")
        private String optionText;
        private Boolean isCorrect = false;
    }

    @Data
    public static class TestQuestionUpsertDto {
        private Long id;
        @NotBlank(message = "Текст вопроса обязателен")
        private String questionText;
        private Integer sortOrder = 0;
        @NotEmpty(message = "У вопроса должны быть варианты ответов")
        private List<TestOptionUpsertDto> options;
    }

    @Data
    public static class TestUpsertRequestDto {
        private Long sectionId;
        @NotBlank(message = "Название теста обязательно")
        private String title;
        private String description;
        @Min(value = 1, message = "Количество вопросов должно быть не менее 1")
        private Integer questionsLimit = 10;
        private Boolean hasTimeLimit = false;
        private Integer timeLimitMinutes;
        private Boolean isHidden = false;
        private Boolean allowTraining;
        private Integer passScorePercent;
        private List<TestQuestionUpsertDto> questions;
    }

    @Data
    @Builder
    public static class TestSummaryDto {
        private Long id;
        private Long sectionId;
        private String title;
        private String description;
        private Integer questionsLimit;
        private Integer bankQuestionsCount;
        private Boolean hasTimeLimit;
        private Integer timeLimitMinutes;
        private Boolean isHidden;
        private Boolean allowTraining;
        private Integer passScorePercent;
        // Информация для текущего пользователя
        private Integer userAttemptsCount;
        private Boolean canStartNow;
        private Boolean hasInProgressAttempt;
        private Double lastScorePercent;
    }

    @Data
    @Builder
    public static class TestAdminDetailDto {
        private Long id;
        private Long sectionId;
        private String title;
        private String description;
        private Integer questionsLimit;
        private Boolean hasTimeLimit;
        private Integer timeLimitMinutes;
        private Boolean isHidden;
        private Boolean allowTraining;
        private Integer passScorePercent;
        private List<TestQuestionUpsertDto> questions;
    }

    // --- Прохождение теста (Session / Attempt) ---
    @Data
    @Builder
    public static class AttemptOptionViewDto {
        private Long id;
        private String code;
        private String optionText;
    }

    @Data
    @Builder
    public static class AttemptQuestionViewDto {
        private Long attemptAnswerId;
        private Long questionId;
        private Integer questionOrder;
        private String questionText;
        private Boolean isMultipleChoice;
        private List<AttemptOptionViewDto> options;
        private Boolean isAnswered;
        private List<String> selectedCodes;
        private List<String> correctCodes;
        private LocalDateTime answeredAt;
    }

    @Data
    @Builder
    public static class TestAttemptSessionDto {
        private Long attemptId;
        private Long testId;
        private String testTitle;
        private Integer attemptNumber;
        private String status; // IN_PROGRESS, COMPLETED, EXPIRED
        private LocalDateTime startedAt;
        private LocalDateTime finishedAt;
        private Boolean hasTimeLimit;
        private Integer timeLimitMinutes;
        private Long remainingSeconds;
        private Integer totalQuestions;
        private Integer answeredQuestions;
        private Integer correctAnswers;
        private Double scorePercent;
        private Boolean isTraining;
        private Integer passScorePercent;
        private Boolean isPassed;
        private List<AttemptQuestionViewDto> questions;
    }

    @Data
    public static class SubmitAnswerRequestDto {
        private Long questionId;
        private List<String> selectedCodes;
    }

    // --- Контроль тестирования и статистика ---
    @Data
    @Builder
    public static class TestEmployeeControlRowDto {
        private Long profileId;
        private String fullName;
        private String departmentName;
        private String positionName;
        private Integer attemptsCount;
        private Integer unusedExtraGrantsCount;
        private Double bestScorePercent;
        private Double lastScorePercent;
        private String lastStatus;
        private LocalDateTime lastAttemptDate;
    }

    @Data
    @Builder
    public static class TestControlOverviewDto {
        private Long testId;
        private String testTitle;
        private String sectionTitle;
        private Integer questionsLimit;
        private Integer totalParticipants;
        private Integer completedAttemptsTotal;
        private Double averageScorePercent;
        private Integer passScorePercent;
        private Boolean isPassed;
        private List<TestEmployeeControlRowDto> employees;
        private List<TestQuestionStatDto> questionStats;
    }

    @Data
    @Builder
    public static class AttemptProtocolAnswerDto {
        private Integer questionOrder;
        private String questionText;
        private String selectedCodes;
        private String correctCodes;
        private Boolean isAnswered;
        private Boolean isCorrect;
        private LocalDateTime answeredAt;
    }

    @Data
    @Builder
    public static class AttemptProtocolDto {
        private Long attemptId;
        private Integer attemptNumber;
        private String status;
        private LocalDateTime startedAt;
        private LocalDateTime finishedAt;
        private String testTitle;
        private String sectionTitle;
        private String employeeFullName;
        private String departmentName;
        private String positionName;
        private Integer totalQuestions;
        private Integer answeredQuestions;
        private Integer correctAnswers;
        private Double scorePercent;
        private Integer passScorePercent;
        private Boolean isPassed;
        private List<AttemptProtocolAnswerDto> answers;
    }

    @Data
    @Builder
    public static class TestQuestionStatDto {
        private Long questionId;
        private Integer sortOrder;
        private String questionText;
        private Integer timesAsked;
        private Integer correctAnswersCount;
        private Double correctPercent;
    }
}
