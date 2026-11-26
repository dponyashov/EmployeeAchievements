package ru.ponyashov.employee_achievements.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ponyashov.employee_achievements.entity.UserDashboardSettingsEntity;

public interface UserDashboardSettingsRepository extends JpaRepository<UserDashboardSettingsEntity, Long> {
}
