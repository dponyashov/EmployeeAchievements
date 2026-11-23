package ru.ponyashov.employee_achievements.entity.testing;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_tests")
public class TestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private TestSectionEntity section;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "questions_limit", nullable = false)
    private Integer questionsLimit;

    @Column(name = "has_time_limit", nullable = false)
    private Boolean hasTimeLimit;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(name = "is_hidden", nullable = false)
    private Boolean isHidden;

    @Column(name = "allow_training", nullable = false)
    private Boolean allowTraining = false;

    @Column(name = "pass_score_percent", nullable = false)
    private Integer passScorePercent = 80;

    @Builder.Default
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<TestQuestionEntity> questions = new ArrayList<>();
}
