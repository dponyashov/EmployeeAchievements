package ru.ponyashov.employee_achievements.dto;

import lombok.*;
import ru.ponyashov.employee_achievements.dto.response.ProfileResponseDto;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class AuthResultDto {
    private String accessToken;
    private String refreshToken;
    private ProfileResponseDto user;
}
