package com.cashbook.domain.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CategoryCreateRequest {

    @NotBlank(message = "카테고리명은 필수입니다.")
    @Size(max = 50, message = "카테고리명은 50자 이하여야 합니다.")
    private String name;

    @NotBlank(message = "타입은 필수입니다. (INCOME | EXPENSE)")
    private String type;

    @Size(max = 50, message = "아이콘 키는 50자 이하여야 합니다.")
    private String icon;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상은 HEX 형식이어야 합니다. (예: #4CAF50)")
    private String color;

    private Short sortOrder;
}
