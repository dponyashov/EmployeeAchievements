package ru.ponyashov.employee_achievements.dto.response;

import lombok.*;

import java.util.Collection;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class ProfileResponseDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private PositionResponseDto position;
    private DepartmentResponseDto department;
}
