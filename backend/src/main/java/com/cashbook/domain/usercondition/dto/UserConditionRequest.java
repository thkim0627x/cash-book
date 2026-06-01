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

    @Pattern(regexp = "^(LOW|MIDDLE|HIGH)$",
             message = "소득 수준은 LOW / MIDDLE / HIGH 중 하나여야 합니다.")
    private String incomeLevel;

    @Pattern(regexp = "^(EMPLOYED|UNEMPLOYED|FREELANCE|STUDENT)$",
             message = "고용 상태는 EMPLOYED / UNEMPLOYED / FREELANCE / STUDENT 중 하나여야 합니다.")
    private String employmentStatus;

    @Size(max = 50, message = "지역은 50자 이하여야 합니다.")
    private String region;
}
