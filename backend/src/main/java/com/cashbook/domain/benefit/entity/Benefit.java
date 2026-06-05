package com.cashbook.domain.benefit.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Benefit {
    private Long id;
    private String externalId;       // 외부 API 정책 번호 (중복 방지)
    private String title;
    private String category;         // 주거|취업|복지|금융
    private Short targetAgeMin;
    private Short targetAgeMax;
    private String description;
    private String host;             // 주관 기관 (예: 금융위원회)
    private String benefitSummary;   // 혜택 요약 (예: 월 최대 70만원)
    private String targetIncome;     // 소득 기준 (예: 중위소득 180% 이하)
    private String targetRegion;     // 지역 제한 (null = 전국)
    private String applyUrl;
    private LocalDate deadline;
    private String source;           // 온통청년|복지로|고용24|직접입력
    private Long viewCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
