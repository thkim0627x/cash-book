package com.cashbook.domain.benefit.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 혜택 상세 응답 DTO (description 포함).
 */
@Getter
@NoArgsConstructor
public class BenefitDetailResponse {
    private Long id;
    private String title;
    private String category;
    private Short targetAgeMin;
    private Short targetAgeMax;
    private String description;
    private String applyUrl;
    private LocalDate deadline;
    private String source;
    private Boolean expired;
    private OffsetDateTime createdAt;
}
