package ru.ponyashov.employee_achievements.service.impl;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.config.AppConfig;
import ru.ponyashov.employee_achievements.dto.AuthResultDto;
import ru.ponyashov.employee_achievements.service.JwtService;
import ru.ponyashov.employee_achievements.service.UserService;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private final AppConfig appConfig;

    private final UserService userService;

    public String generateAccessToken(String userName) {

        Map<String, Collection<String>> claims = new HashMap<>();

        var currentUser = userService.loadUserByUsername(userName);

        claims.put("roles", currentUser.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());

        return Jwts.builder()
                .subject(userName)
                .issuedAt(new Date(System.currentTimeMillis()))
                .claims(claims)
                .expiration(new Date(System.currentTimeMillis() + appConfig.jwt().atExpiration()))
                .signWith(Keys.hmacShaKeyFor(appConfig.jwt().atSecretKey().getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    public String generateRefreshToken(String userName) {
        return Jwts.builder()
                .subject(userName)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + appConfig.jwt().rtExpiration()))
                .signWith(Keys.hmacShaKeyFor(appConfig.jwt().rtSecretKey().getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    @Override
    public AuthResultDto generateTokens(String userName) {
        return AuthResultDto.builder()
                .accessToken(generateAccessToken(userName))
                .refreshToken(generateRefreshToken(userName))
                .build();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(appConfig.jwt().atSecretKey().getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String extractRtUsername(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(appConfig.jwt().rtSecretKey().getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public boolean isRTokenValid(String token, UserDetails userDetails) {
        final String username = extractRtUsername(token);
        return (username.equals(userDetails.getUsername())) && !isRTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(appConfig.jwt().atSecretKey().getBytes(StandardCharsets.UTF_8))).build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
        return expiration.before(new Date());
    }

    private boolean isRTokenExpired(String token) {
        Date expiration = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(appConfig.jwt().rtSecretKey().getBytes(StandardCharsets.UTF_8))).build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
        return expiration.before(new Date());
    }
}