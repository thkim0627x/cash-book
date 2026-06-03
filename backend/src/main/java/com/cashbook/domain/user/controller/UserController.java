package com.cashbook.domain.user.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.auth.dto.UserResponse;
import com.cashbook.domain.user.dto.UpdatePasswordRequest;
import com.cashbook.domain.user.dto.UpdateProfileRequest;
import com.cashbook.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * PUT /api/users/me — 회원 정보 수정 (본인만)
     * name, birth_year 수정 가능. 이메일은 변경 불가.
     */
    @PutMapping("/me")
    public ApiResponse<UserResponse> updateProfile(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid UpdateProfileRequest req
    ) {
        return ApiResponse.ok("회원 정보가 수정되었습니다.",
                userService.updateProfile(userId, req));
    }

    /**
     * PUT /api/users/me/password — 비밀번호 변경 (본인만)
     * 현재 비밀번호 확인 후 변경.
     */
    @PutMapping("/me/password")
    public ApiResponse<Void> updatePassword(
            @AuthenticationPrincipal Long userId,
            @RequestBody @Valid UpdatePasswordRequest req
    ) {
        userService.updatePassword(userId, req);
        return ApiResponse.ok("비밀번호가 변경되었습니다.");
    }
}
