package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ponyashov.employee_achievements.entity.TaskQueryEntity;

import java.util.Collection;

@Repository
public interface TaskQueryRepository extends JpaRepository<TaskQueryEntity, Long> {
    Collection<TaskQueryEntity> findAllByTaskId(Long taskId);
    Collection<TaskQueryEntity> findAllByTaskIdAndName(Long taskId, String name);
}
