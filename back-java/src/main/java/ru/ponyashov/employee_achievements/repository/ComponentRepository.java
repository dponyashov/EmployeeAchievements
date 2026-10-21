package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ponyashov.employee_achievements.entity.ComponentEntity;

import java.util.Collection;

@Repository
public interface ComponentRepository extends JpaRepository<ComponentEntity, Long> {
    Collection<ComponentEntity> findAllByNameIgnoreCase(String name);
}
