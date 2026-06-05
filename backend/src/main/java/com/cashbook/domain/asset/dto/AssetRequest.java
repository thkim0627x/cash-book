package com.cashbook.domain.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AssetRequest {

    @NotBlank(message = "자산 이름을 입력해주세요.")
    @Size(max = 50, message = "자산 이름은 50자 이하여야 합니다.")
    private String name;

    @NotNull(message = "초기 금액을 입력해주세요.")
    private Long initialAmount;

    @NotBlank(message = "자산 유형을 선택해주세요.")
    @Pattern(regexp = "^(SAVINGS|CREDIT_CARD|CASH|ETC)$", message = "유효하지 않은 자산 유형입니다.")
    private String assetType;
}
