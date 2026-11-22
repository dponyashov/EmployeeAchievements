package ru.ponyashov.employee_achievements.repository.testing;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ponyashov.employee_achievements.entity.testing.TestSectionEntity;
import java.util.List;

public interface TestSectionRepository extends JpaRepository<TestSectionEntity, Long> {
    List<TestSectionEntity> findAllByOrderBySortOrderAscIdAsc();
    List<TestSectionEntity> findAllByIsActiveTrueOrderBySortOrderAscIdAsc();
}
