package com.cashbook.domain.budget.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 예산 응답 DTO.
 * MyBatis ResultMap 직접 매핑 → @NoArgsConstructor 필수.
 * spent/remaining은 SQL CTE에서 계산.
 */
@Getter
@NoArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long categoryId;       // NULL = 전체 예산
    private String categoryName;   // NULL = "전체"
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal amount;     // 설정 예산
    private BigDecimal spent;      // 실제 지출 (transactions SUM)
    private BigDecimal remaining;  // 남은 예산 (amount - spent)
    private String yearMonth;
}
