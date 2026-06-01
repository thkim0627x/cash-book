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
    private String title;
    private String category;       // 주거|취업|복지|금융|교육|문화|기타
    private Short targetAgeMin;    // NULL = 하한 없음
    private Short targetAgeMax;    // NULL = 상한 없음
    private String description;
    private String applyUrl;
    private LocalDate deadline;    // NULL = 상시
    private String source;         // 온통청년|복지로|고용24|기타
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
