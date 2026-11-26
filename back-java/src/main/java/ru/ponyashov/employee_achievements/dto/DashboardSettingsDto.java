package ru.ponyashov.employee_achievements.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSettingsDto {
    private Integer columnsCount;
    private Integer rowsCount;
    private List<String> tiles;
}