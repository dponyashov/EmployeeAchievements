package ru.ponyashov.employee_achievements.dto.response;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class ServiceResponseDto {
    private Long id;
    private String name;
}
