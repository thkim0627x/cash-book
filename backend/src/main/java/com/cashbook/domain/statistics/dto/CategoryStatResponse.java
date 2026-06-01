package com.cashbook.domain.statistics.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * GET /api/statistics/category 응답 래퍼.
 * totalExpense = items의 amount 합산 (서비스 계산).
 */
@Getter
@Builder
public class CategoryStatResponse {
    private int year;
    private int month;
    private BigDecimal totalExpense;  // 해당 월 전체 지출 합계
    private List<CategoryStatItem> items;
}
