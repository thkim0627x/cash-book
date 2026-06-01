package com.cashbook.domain.statistics.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.statistics.dto.CategoryStatResponse;
import com.cashbook.domain.statistics.dto.TrendItem;
import com.cashbook.domain.statistics.service.StatisticsService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Validated   // @Min / @Max 파라미터 검증 활성화
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * GET /api/statistics/category?year=2026&month=6
     * 카테고리별 지출 금액 + 비율
     * year/month 미입력 시 현재 월 기본값 적용
     */
    @GetMapping("/category")
    public ApiResponse<CategoryStatResponse> getCategoryStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        if (year  == null) year  = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        return ApiResponse.ok(statisticsService.getCategoryStats(currentUserId(), year, month));
    }

    /**
     * GET /api/statistics/trend?months=6
     * 최근 N개월 수입/지출 추이 (차트용)
     * months: 1~24, 기본값 6
     */
    @GetMapping("/trend")
    public ApiResponse<List<TrendItem>> getMonthlyTrend(
            @RequestParam(defaultValue = "6")
            @Min(value = 1,  message = "months는 1 이상이어야 합니다.")
            @Max(value = 24, message = "months는 24 이하여야 합니다.")
            int months
    ) {
        return ApiResponse.ok(statisticsService.getMonthlyTrend(currentUserId(), months));
    }

    // ──────────────────────────────
    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
