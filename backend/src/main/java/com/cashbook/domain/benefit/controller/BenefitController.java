package com.cashbook.domain.benefit.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.benefit.dto.BenefitDetailResponse;
import com.cashbook.domain.benefit.dto.BenefitPageResponse;
import com.cashbook.domain.benefit.dto.BenefitResponse;
import com.cashbook.domain.benefit.service.BenefitService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/benefits")
@RequiredArgsConstructor
public class BenefitController {

    private final BenefitService benefitService;

    /**
     * GET /api/benefits
     *   ?category=주거   (선택: 주거|취업|복지|금융|교육|문화|기타)
     *   &age=26          (선택: 나이 필터)
     *   &includeExpired=false (기본 false)
     *   &page=0 &size=20
     */
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

    /**
     * GET /api/benefits/recommended
     * 현재 유저 조건(birth_year + user_conditions) 기반 추천
     * NOTE: Spring MVC 에서 리터럴 경로 /recommended 는 /{id} 보다 우선 매핑됨
     */
    @GetMapping("/recommended")
    public ApiResponse<List<BenefitResponse>> getRecommended() {
        return ApiResponse.ok(benefitService.getRecommended(currentUserId()));
    }

    /**
     * GET /api/benefits/{id}
     * 혜택 상세 (description 포함)
     */
    @GetMapping("/{id}")
    public ApiResponse<BenefitDetailResponse> getDetail(@PathVariable Long id) {
        return ApiResponse.ok(benefitService.getBenefitDetail(id));
    }

    // ──────────────────────────────
    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
