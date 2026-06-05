package com.cashbook.domain.usercondition.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * 사용자 조건 저장 요청 (upsert).
 * 모든 필드 선택(nullable) — 부분 업데이트 지원.
 */
@Getter
public class UserConditionRequest {

    @Pattern(regexp = "^(UNDER_500|500_TO_1000|1000_TO_2000|OVER_2000)$",
             message = "소득 수준은 UNDER_500 / 500_TO_1000 / 1000_TO_2000 / OVER_2000 중 하나여야 합니다.")
    private String incomeLevel;

    @Pattern(regexp = "^(UNEMPLOYED|EMPLOYED|FREELANCER|SELF_EMPLOYED)$",
             message = "고용 상태는 UNEMPLOYED / EMPLOYED / FREELANCER / SELF_EMPLOYED 중 하나여야 합니다.")
    private String employmentStatus;

    @Size(max = 50, message = "지역은 50자 이하여야 합니다.")
    private String region;
}
