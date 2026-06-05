package com.cashbook.domain.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SubscriptionRequest {

    @NotBlank(message = "구독명을 입력해주세요.")
    @Size(max = 50, message = "구독명은 50자 이하여야 합니다.")
    private String name;

    @NotNull(message = "구독 시작일을 입력해주세요.")
    private LocalDate startDate;

    @NotBlank(message = "결제 주기를 선택해주세요.")
    @Pattern(regexp = "^(MONTHLY|YEARLY|WEEKLY)$", message = "유효하지 않은 결제 주기입니다.")
    private String billingCycle;

    @NotNull(message = "결제 금액을 입력해주세요.")
    private Long amount;
}
