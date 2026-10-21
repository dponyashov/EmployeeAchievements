package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ponyashov.employee_achievements.entity.ServiceEntity;

import java.util.Collection;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    Collection<ServiceEntity> findAllByNameIgnoreCase(String name);
}
