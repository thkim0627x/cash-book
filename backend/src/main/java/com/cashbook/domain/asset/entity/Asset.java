package com.cashbook.domain.asset.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {
    private Long id;
    private Long userId;
    private String name;
    private Long initialAmount;
    private String assetType;   // SAVINGS, CREDIT_CARD, CASH, ETC
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
