package ru.ponyashov.employee_achievements.repository.testing;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ponyashov.employee_achievements.entity.testing.TestEntity;
import java.util.List;

public interface TestRepository extends JpaRepository<TestEntity, Long> {
    List<TestEntity> findAllBySectionIdOrderByIdAsc(Long sectionId);
    List<TestEntity> findAllBySectionIdAndIsHiddenFalseOrderByIdAsc(Long sectionId);
}
