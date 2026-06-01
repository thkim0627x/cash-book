package com.cashbook.domain.transaction.entity;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
public class Transaction {
    private Long id;
    private Long userId;
    private Long categoryId;
    private String type;           // INCOME | EXPENSE
    private BigDecimal amount;
    private String memo;
    private LocalDate txnDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
