package ru.ponyashov.employee_achievements.dto.response;

import lombok.*;
import ru.ponyashov.employee_achievements.entity.ComponentEntity;
import ru.ponyashov.employee_achievements.entity.ServiceEntity;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;


@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class TaskResponseDto {
    private Long id;
    private String title;
    private String description;
    private Long year;
    private Long month;
    private LocalDate enterDate;
    private LocalTime enterTime;
    private ProfileResponseDto profile;
    private ServiceResponseDto service;
    private ComponentResponseDto component;
    private ProfileResponseDto author;
    private Collection<TaskQueryResponseDto> queries;
}
