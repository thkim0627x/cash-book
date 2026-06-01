package com.cashbook.domain.benefit.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 혜택 목록 응답 DTO (description 제외 — 상세에서만 제공).
 */
@Getter
@NoArgsConstructor
public class BenefitResponse {
    private Long id;
    private String title;
    private String category;
    private Short targetAgeMin;
    private Short targetAgeMax;
    private String applyUrl;
    private LocalDate deadline;    // NULL = 상시
    private String source;
    private Boolean expired;       // 마감 여부 (서비스 계산)
}
