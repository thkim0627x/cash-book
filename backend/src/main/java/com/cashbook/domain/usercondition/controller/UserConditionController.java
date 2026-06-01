package com.cashbook.domain.usercondition.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.usercondition.dto.UserConditionRequest;
import com.cashbook.domain.usercondition.dto.UserConditionResponse;
import com.cashbook.domain.usercondition.service.UserConditionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-conditions")
@RequiredArgsConstructor
public class UserConditionController {

    private final UserConditionService userConditionService;

    /**
     * GET /api/user-conditions/me
     * 현재 유저 조건 조회 (미등록 시 data=null)
     */
    @GetMapping("/me")
    public ApiResponse<UserConditionResponse> getMyCondition() {
        UserConditionResponse resp = userConditionService.getMyCondition(currentUserId());
        return ApiResponse.ok(resp);
    }

    /**
     * POST /api/user-conditions
     * 사용자 조건 저장 (upsert — 등록 or 수정 통합)
     * null 필드는 기존값 유지 (부분 업데이트)
     */
    @PostMapping
    public ApiResponse<UserConditionResponse> save(@RequestBody @Valid UserConditionRequest req) {
        UserConditionResponse resp = userConditionService.save(currentUserId(), req);
        return ApiResponse.ok("조건이 저장되었습니다.", resp);
    }

    // ──────────────────────────────
    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
