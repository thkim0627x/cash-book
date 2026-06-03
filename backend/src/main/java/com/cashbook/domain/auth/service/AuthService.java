package com.cashbook.domain.auth.service;

import com.cashbook.domain.auth.dto.LoginRequest;
import com.cashbook.domain.auth.dto.LoginResponse;
import com.cashbook.domain.auth.dto.RegisterRequest;
import com.cashbook.domain.auth.dto.ReissueResponse;
import com.cashbook.domain.auth.dto.UserResponse;
import com.cashbook.domain.auth.entity.RefreshToken;
import com.cashbook.domain.auth.entity.User;
import com.cashbook.domain.auth.mapper.AuthMapper;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import com.cashbook.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    /** 회원가입 */
    @Transactional
    public void register(RegisterRequest req) {
        // 이메일 중복 체크
        authMapper.findByEmail(req.getEmail()).ifPresent(u -> {
            throw new BusinessException(ErrorCode.EMAIL_DUPLICATE);
        });

        User user = User.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))  // BCrypt
                .name(req.getName())
                .birthYear(req.getBirthYear())
                .role("USER")
                .build();

        authMapper.insertUser(user);
    }

    /** 로그인 */
    @Transactional
    public LoginResponse login(LoginRequest req) {
        User user = authMapper.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken  = jwtUtils.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = jwtUtils.generateRefreshToken(user.getId());

        // Refresh Token DB 저장
        OffsetDateTime expiresAt = OffsetDateTime.now()
                .plusSeconds(refreshTokenExpiry / 1000);
        authMapper.upsertRefreshToken(user.getId(), refreshToken, expiresAt);

        return LoginResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    /**
     * Access Token 재발급.
     * ① Refresh Token JWT 서명/만료 검증
     * ② DB 저장 토큰과 일치 여부 + 만료 시각 검증
     * ③ 유효하면 새 Access Token 발급 (role은 DB에서 조회)
     * 무효/만료 시 INVALID_REFRESH_TOKEN(401)
     */
    @Transactional(readOnly = true)
    public ReissueResponse reissue(String refreshToken) {
        // 1. 헤더 누락 또는 JWT 서명/만료 검증 실패
        if (refreshToken == null || refreshToken.isBlank()
                || !jwtUtils.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        Long userId = jwtUtils.getUserId(refreshToken);

        // 2. DB 저장 토큰 일치 + 만료 검증
        RefreshToken stored = authMapper.findRefreshTokenByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN));

        if (!stored.getToken().equals(refreshToken)
                || stored.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 3. 새 Access Token 발급 (role 필요 → 사용자 조회)
        User user = authMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String newAccessToken = jwtUtils.generateAccessToken(user.getId(), user.getRole());
        return ReissueResponse.builder()
                .accessToken(newAccessToken)
                .build();
    }

    /** 현재 로그인 유저 정보 조회 */
    @Transactional(readOnly = true)
    public UserResponse getMe(Long userId) {
        User user = authMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }

    /** 로그아웃 — Refresh Token 삭제 */
    @Transactional
    public void logout(Long userId) {
        authMapper.deleteRefreshTokenByUserId(userId);
    }
}
