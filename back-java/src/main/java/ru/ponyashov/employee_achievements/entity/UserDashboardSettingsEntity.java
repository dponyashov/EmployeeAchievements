package ru.ponyashov.employee_achievements.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "t_user_dashboard_settings", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDashboardSettingsEntity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Builder.Default
    @Column(name = "columns_count", nullable = false)
    private Integer columnsCount = 4;

    @Builder.Default
    @Column(name = "rows_count", nullable = false)
    private Integer rowsCount = 3;

    @Builder.Default
    @Column(name = "tiles_json", nullable = false, columnDefinition = "TEXT")
    private String tilesJson = "[\"achievements\",\"employees\",\"bookings\",\"testing\",\"news\",\"admin\"]";

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
