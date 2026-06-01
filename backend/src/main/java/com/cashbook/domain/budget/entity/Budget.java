package com.cashbook.domain.budget.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget {
    private Long id;
    private Long userId;
    private Long categoryId;      // NULL = 월 전체 예산
    private BigDecimal amount;
    private String yearMonth;     // 'YYYY-MM' (예: '2026-06')
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
