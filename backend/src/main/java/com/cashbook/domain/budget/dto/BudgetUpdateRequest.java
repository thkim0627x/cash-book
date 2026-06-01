package com.cashbook.domain.budget.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * 예산 수정 요청.
 * categoryId, yearMonth는 식별자이므로 수정 불가 — amount만 변경 가능.
 */
@Getter
public class BudgetUpdateRequest {

    @NotNull(message = "예산 금액은 필수입니다.")
    @DecimalMin(value = "0", message = "예산 금액은 0 이상이어야 합니다.")
    private BigDecimal amount;
}
