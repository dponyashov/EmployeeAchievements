package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ponyashov.employee_achievements.entity.DepartmentEntity;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<DepartmentEntity, Long> {
    Collection<DepartmentEntity> findAllByNameIgnoreCase(String name);
}
