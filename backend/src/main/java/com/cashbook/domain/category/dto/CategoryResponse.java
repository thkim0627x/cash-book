package com.cashbook.domain.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor   // MyBatis ResultMap 매핑용
@AllArgsConstructor  // @Builder + @NoArgsConstructor 동시 사용 시 필수
public class CategoryResponse {
    private Long id;
    private String name;
    private String type;
    private String icon;
    private String color;
    private Boolean isDefault;
    private Short sortOrder;
}
