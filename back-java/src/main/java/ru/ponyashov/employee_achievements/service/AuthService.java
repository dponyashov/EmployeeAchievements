package ru.ponyashov.employee_achievements.service;

import ru.ponyashov.employee_achievements.dto.AuthResultDto;
import ru.ponyashov.employee_achievements.dto.request.LoginRequestDto;
import ru.ponyashov.employee_achievements.dto.request.RegistryRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;

public interface AuthService {
    AuthResultDto registry(RegistryRequestDto dto);
    ResponseMessageDto logout();
    AuthResultDto authenticate(LoginRequestDto loginDto);
    AuthResultDto refreshAccessToken(String refreshToken);
}
