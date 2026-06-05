package com.cashbook.domain.subscription.dto;

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
public class SubscriptionResponse {
    private Long id;
    private String name;
    private LocalDate startDate;
    private String billingCycle;
    private Long amount;
    private Integer nextBillingDayOfMonth;
    private OffsetDateTime createdAt;
}
