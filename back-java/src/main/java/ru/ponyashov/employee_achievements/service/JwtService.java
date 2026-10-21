package ru.ponyashov.employee_achievements.service;

import org.springframework.security.core.userdetails.UserDetails;
import ru.ponyashov.employee_achievements.dto.AuthResultDto;

public interface JwtService {

    AuthResultDto generateTokens(String userName);

    String extractUsername(String jwt);

    boolean isTokenValid(String token, UserDetails userDetails);

    String extractRtUsername(String jwt);

    boolean isRTokenValid(String token, UserDetails userDetails);
}
