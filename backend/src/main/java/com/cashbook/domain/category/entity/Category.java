package com.cashbook.domain.category.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Builder
@NoArgsConstructor   // MyBatis ResultMap 매핑용
@AllArgsConstructor  // @Builder + @NoArgsConstructor 동시 사용 시 필수
public class Category {
    private Long id;
    private Long userId;
    private String name;
    private String type;       // INCOME | EXPENSE
    private String icon;
    private String color;
    private Boolean isDefault;
    private Short sortOrder;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
