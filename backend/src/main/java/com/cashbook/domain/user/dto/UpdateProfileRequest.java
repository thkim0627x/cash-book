package com.cashbook.domain.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * 회원 정보 수정 요청.
 * 이메일은 수정 불가 (로그인 식별자) — 포함하지 않음.
 */
@Getter
public class UpdateProfileRequest {

    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
    private String name;

    @Min(value = 1900, message = "출생연도가 올바르지 않습니다.")
    @Max(value = 2100, message = "출생연도가 올바르지 않습니다.")
    private Short birthYear;
}
