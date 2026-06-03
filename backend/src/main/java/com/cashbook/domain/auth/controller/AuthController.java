package com.cashbook.domain.auth.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.auth.dto.LoginRequest;
import com.cashbook.domain.auth.dto.LoginResponse;
import com.cashbook.domain.auth.dto.RegisterRequest;
import com.cashbook.domain.auth.dto.ReissueResponse;
import com.cashbook.domain.auth.dto.UserResponse;
import com.cashbook.domain.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** POST /api/auth/register — 회원가입 */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> register(@RequestBody @Valid RegisterRequest req) {
        authService.register(req);
        return ApiResponse.ok("회원가입이 완료되었습니다.");
    }

    /** POST /api/auth/login — 로그인 */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest req) {
        LoginResponse response = authService.login(req);
        return ApiResponse.ok("로그인 성공", response);
    }

    /**
     * POST /api/auth/reissue — Access Token 재발급
     * Refresh-Token 헤더로 Refresh Token 전달.
     * 무효/만료 시 401.
     */
    @PostMapping("/reissue")
    public ApiResponse<ReissueResponse> reissue(
            @RequestHeader(value = "Refresh-Token", required = false) String refreshToken) {
        return ApiResponse.ok("토큰이 재발급되었습니다.", authService.reissue(refreshToken));
    }

    /** GET /api/auth/me — 현재 로그인 유저 정보 조회 (인증 필요) */
    @GetMapping("/me")
    public ApiResponse<UserResponse> getMe() {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ApiResponse.ok(authService.getMe(userId));
    }

    /** POST /api/auth/logout — 로그아웃 (인증 필요) */
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        authService.logout(userId);
        return ApiResponse.ok("로그아웃 되었습니다.");
    }
}
