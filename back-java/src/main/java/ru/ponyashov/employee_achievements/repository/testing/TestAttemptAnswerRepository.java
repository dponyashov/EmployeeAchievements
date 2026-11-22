package ru.ponyashov.employee_achievements.repository.testing;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ponyashov.employee_achievements.entity.testing.TestAttemptAnswerEntity;
import java.util.List;

public interface TestAttemptAnswerRepository extends JpaRepository<TestAttemptAnswerEntity, Long> {
    List<TestAttemptAnswerEntity> findAllByAttemptIdOrderByQuestionOrderAscIdAsc(Long attemptId);
}
