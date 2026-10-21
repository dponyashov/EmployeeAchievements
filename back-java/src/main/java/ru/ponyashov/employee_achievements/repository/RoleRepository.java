package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ponyashov.employee_achievements.entity.RoleEntity;

import java.util.Collection;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    Collection<RoleEntity> findAllByNameIgnoreCase(String name);
}
