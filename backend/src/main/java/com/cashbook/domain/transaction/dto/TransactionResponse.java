package com.cashbook.domain.transaction.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 거래내역 응답 DTO.
 * MyBatis resultMap 매핑 + API 응답 겸용.
 * categories JOIN으로 categoryName/Icon/Color 포함.
 */
@Getter
@NoArgsConstructor
public class TransactionResponse {
    private Long id;
    private String type;
    private BigDecimal amount;
    private String memo;
    private LocalDate txnDate;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private Long assetId;
    private String assetName;
    private OffsetDateTime createdAt;
}
