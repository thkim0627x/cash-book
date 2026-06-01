package com.cashbook.domain.statistics.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 카테고리별 지출 통계 단건 DTO.
 * MyBatis ResultMap 매핑 + SQL 윈도우 함수로 ratio 계산.
 */
@Getter
@NoArgsConstructor
public class CategoryStatItem {
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal amount;   // 해당 카테고리 지출 합계
    private BigDecimal ratio;    // 전체 지출 대비 비율 (%) — SQL OVER() 계산
}
