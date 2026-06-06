package com.cashbook.domain.transaction.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class TransactionCreateRequest {

    @NotNull(message = "카테고리는 필수입니다.")
    private Long categoryId;

    /** 선택사항 — 연결할 자산 계좌 ID */
    private Long assetId;

    @NotBlank(message = "타입은 필수입니다. (INCOME | EXPENSE)")
    private String type;

    @NotNull(message = "금액은 필수입니다.")
    @DecimalMin(value = "0.01", message = "금액은 0보다 커야 합니다.")
    private BigDecimal amount;

    @Size(max = 500, message = "메모는 500자 이하여야 합니다.")
    private String memo;

    @NotNull(message = "거래 날짜는 필수입니다.")
    private LocalDate txnDate;
}
