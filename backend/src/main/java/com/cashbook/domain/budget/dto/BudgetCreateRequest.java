package com.cashbook.domain.budget.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class BudgetCreateRequest {

    /** NULL 허용 — NULL이면 해당 월 전체 예산 */
    private Long categoryId;

    @NotNull(message = "예산 금액은 필수입니다.")
    @DecimalMin(value = "0", message = "예산 금액은 0 이상이어야 합니다.")
    private BigDecimal amount;

    @NotBlank(message = "년월은 필수입니다.")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$",
             message = "년월 형식이 올바르지 않습니다. (예: 2026-06)")
    private String yearMonth;
}
