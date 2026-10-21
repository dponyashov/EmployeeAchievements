package ru.ponyashov.employee_achievements.dto.response;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class RoleResponseDto {
    private Long id;
    private String name;
    private String description;
}
