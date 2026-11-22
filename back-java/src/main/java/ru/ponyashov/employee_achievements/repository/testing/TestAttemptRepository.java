package ru.ponyashov.employee_achievements.repository.testing;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ponyashov.employee_achievements.entity.testing.TestAttemptEntity;

import java.util.List;
import java.util.Optional;

public interface TestAttemptRepository extends JpaRepository<TestAttemptEntity, Long> {
    List<TestAttemptEntity> findAllByTestIdAndProfileIdOrderByAttemptNumberAsc(Long testId, Long profileId);
    Optional<TestAttemptEntity> findFirstByTestIdAndProfileIdAndStatusOrderByIdDesc(Long testId, Long profileId, String status);
    List<TestAttemptEntity> findAllByTestIdOrderByStartedAtDesc(Long testId);
}
