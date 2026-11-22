package ru.ponyashov.employee_achievements.repository.testing;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ponyashov.employee_achievements.entity.testing.TestExtraGrantEntity;
import java.util.List;
import java.util.Optional;

public interface TestExtraGrantRepository extends JpaRepository<TestExtraGrantEntity, Long> {
    Optional<TestExtraGrantEntity> findFirstByTestIdAndProfileIdAndIsUsedFalseOrderByIdAsc(Long testId, Long profileId);
    List<TestExtraGrantEntity> findAllByTestIdAndProfileIdAndIsUsedFalse(Long testId, Long profileId);
}
