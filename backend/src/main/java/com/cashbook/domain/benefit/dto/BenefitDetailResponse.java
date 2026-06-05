package com.cashbook.domain.benefit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
public class BenefitDetailResponse {
    private Long id;
    private String title;
    private String category;
    private Short targetAgeMin;
    private Short targetAgeMax;
    private String description;
    private String host;
    @JsonProperty("benefit")
    private String benefitSummary;
    private String targetIncome;
    private String targetRegion;
    private String applyUrl;
    private LocalDate deadline;
    private String source;
    private Boolean expired;
    private Boolean isNew;
    private Long viewCount;
    private OffsetDateTime createdAt;
}
