package ru.ponyashov.employee_achievements.dto.response;

import lombok.*;
import ru.ponyashov.employee_achievements.dto.request.ProfileRequestDto;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class LoginResponseDto {
    private String tokenAccess;
    private ProfileResponseDto user;
}
