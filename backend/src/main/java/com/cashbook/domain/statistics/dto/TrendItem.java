package com.cashbook.domain.statistics.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 월별 수입/지출 추이 단건 DTO.
 * generate_series 로 데이터 없는 달도 0으로 채워 반환.
 */
@Getter
@NoArgsConstructor
public class TrendItem {
    private String yearMonth;       // "YYYY-MM"
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;     // totalIncome - totalExpense
}
