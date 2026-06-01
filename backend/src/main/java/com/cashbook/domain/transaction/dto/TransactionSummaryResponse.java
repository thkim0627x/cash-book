package com.cashbook.domain.transaction.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 월별 수입/지출 요약 응답 DTO.
 * MyBatis resultMap 직접 매핑 → @NoArgsConstructor 필수.
 */
@Getter
@NoArgsConstructor
public class TransactionSummaryResponse {
    private BigDecimal totalIncome;   // 수입 합계
    private BigDecimal totalExpense;  // 지출 합계
    private BigDecimal balance;       // 잔액 (수입 - 지출)
    private int year;
    private int month;
}
