package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ponyashov.employee_achievements.entity.PositionEntity;

import java.util.Collection;

@Repository
public interface PositionRepository extends JpaRepository<PositionEntity, Long> {
    Collection<PositionEntity> findAllByNameIgnoreCase(String name);
}
