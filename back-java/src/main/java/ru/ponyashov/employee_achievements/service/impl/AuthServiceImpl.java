package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.AuthResultDto;
import ru.ponyashov.employee_achievements.dto.request.LoginRequestDto;
import ru.ponyashov.employee_achievements.dto.request.RegistryRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ProfileResponseDto;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;
import ru.ponyashov.employee_achievements.mapper.ProfileMapper;
import ru.ponyashov.employee_achievements.service.AuthService;
import ru.ponyashov.employee_achievements.service.JwtService;
import ru.ponyashov.employee_achievements.service.ProfileService;
import ru.ponyashov.employee_achievements.service.UserService;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final ProfileService profileService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResultDto registry(RegistryRequestDto dto) {
        var user = userService.findByUsername(dto.getUserName());

        if (user.isPresent()) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        var newUser = userService.save(dto);

        var tokens = jwtService.generateTokens(newUser.getUserName());

        var profile = profileService.findByEmail(newUser.getUserName());

        return AuthResultDto.builder()
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .user(profile == null
                        ? ProfileResponseDto.builder()
                        .email(newUser.getUserName())
                        .firstName("")
                        .lastName("")
                        .build()
                        : profile)
                .build();

    }

    @Override
    public ResponseMessageDto logout() {
        return ResponseMessageDto.builder()
                .message(List.of("Успешный logout"))
                .statusText(HttpStatus.OK.name())
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @Override
    public AuthResultDto authenticate(LoginRequestDto loginDto) {
        var user = userService.findByUsername(loginDto.getUserName())
                .orElseThrow(() -> new RuntimeException("Неверные данные пользователя!"));

        if(!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())){
            throw new RuntimeException("Неверный логин или пароль");
        }

        var tokens = jwtService.generateTokens(user.getUsername());

        var profile = (user.getProfile() != null
                ? ProfileMapper.entityToDto(user.getProfile())
                : ProfileResponseDto.builder()
                .email(user.getUsername())
                .firstName("")
                .lastName("")
                .build()
        );

        profile.setId(user.getId()); //именно userId;

        return AuthResultDto.builder()
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .user(profile)
                .build();
    }

    @Override
    public AuthResultDto refreshAccessToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new RuntimeException("Нет рефреш токена");
        }

        String userName = jwtService.extractRtUsername(refreshToken);

        if(userName.isEmpty()){
            throw new RuntimeException("Неверный рефреш токен");
        }

        var user = userService.findByUsername(userName)
                .orElseThrow(() -> new RuntimeException("Неверные данные пользователя!"));

        if (!jwtService.isRTokenValid(refreshToken, user)) {
            throw new RuntimeException("Рефреш токен не валиден");
        }

        /// TODO надо еще сделать систему хранения рефреш токенов и ставить метку удаления при логауте
        /// а тут проверять ее

        var tokens = jwtService.generateTokens(userName);

        var profile = (user.getProfile() != null
                ? ProfileMapper.entityToDto(user.getProfile())
                : ProfileResponseDto.builder()
                .email(user.getUsername())
                .firstName("")
                .lastName("")
                .build()
        );

        profile.setId(user.getId()); //именно userId;

        return AuthResultDto.builder()
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .user(profile)
                .build();
    }
}
