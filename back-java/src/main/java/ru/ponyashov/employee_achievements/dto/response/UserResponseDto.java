package ru.ponyashov.employee_achievements.dto.response;

import lombok.*;

import java.util.Collection;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class UserResponseDto {
    private Long id;
    private String userName;
    private Collection<RoleResponseDto> roles;
}
