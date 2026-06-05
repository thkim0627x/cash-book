package com.cashbook.domain.benefit.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.benefit.dto.BenefitDetailResponse;
import com.cashbook.domain.benefit.dto.BenefitPageResponse;
import com.cashbook.domain.benefit.dto.BenefitResponse;
import com.cashbook.domain.benefit.service.BenefitService;
import com.cashbook.domain.usercondition.dto.UserConditionRequest;
import com.cashbook.domain.usercondition.dto.UserConditionResponse;
import com.cashbook.domain.usercondition.service.UserConditionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/benefits")
@RequiredArgsConstructor
public class BenefitController {

    private final BenefitService benefitService;
    private final UserConditionService userConditionService;

    @GetMapping
    public ApiResponse<BenefitPageResponse> getBenefits(
            @RequestParam(required = false)             String  category,
            @RequestParam(required = false)             Integer age,
            @RequestParam(defaultValue = "false")       boolean includeExpired,
            @RequestParam(defaultValue = "0")           int     page,
            @RequestParam(defaultValue = "20")          int     size
    ) {
        return ApiResponse.ok(
                benefitService.getBenefits(category, age, includeExpired, page, size));
    }

    @GetMapping("/recommended")
    public ApiResponse<List<BenefitResponse>> getRecommended() {
        return ApiResponse.ok(benefitService.getRecommended(currentUserId()));
    }

    @GetMapping("/{id}")
    public ApiResponse<BenefitDetailResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.ok(benefitService.getBenefitDetail(id));
    }

    /** GET /api/benefits/conditions — 프론트엔드 기대 경로 */
    @GetMapping("/conditions")
    public ApiResponse<UserConditionResponse> getConditions() {
        return ApiResponse.ok(userConditionService.getMyCondition(currentUserId()));
    }

    /** PUT /api/benefits/conditions — 프론트엔드 기대 경로 */
    @PutMapping("/conditions")
    public ApiResponse<UserConditionResponse> saveConditions(
            @RequestBody @Valid UserConditionRequest req) {
        return ApiResponse.ok(userConditionService.save(currentUserId(), req));
    }

    // ──────────────────────────────
    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
