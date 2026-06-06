package com.cashbook.domain.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponse {
    private Long id;
    private String name;
    private Long initialAmount;
    private Long currentBalance;   // initialAmount + 연결된 거래내역 합계 (자동 계산)
    private String assetType;
    private OffsetDateTime createdAt;
}
