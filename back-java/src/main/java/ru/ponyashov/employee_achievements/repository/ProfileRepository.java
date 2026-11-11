package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {

    // Поиск по части строки без учета регистра (аналог WHERE LOWER(name) LIKE %?%)
//    Optional<ProfileEntity> findByEmailContainingIgnoreCase(String email);

    Optional<ProfileEntity> findByEmailIgnoreCase(String email);
    Optional<ProfileEntity> findByUserId(Long userId);

    Collection<ProfileEntity> findByDepartmentId(Long departmentId);
}
