package com.cashbook.domain.usercondition.dto;

import com.cashbook.domain.usercondition.entity.UserCondition;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class UserConditionResponse {
    private Long id;
    private Long userId;
    private String incomeLevel;
    private String employmentStatus;
    private String region;
    private OffsetDateTime updatedAt;

    public static UserConditionResponse from(UserCondition uc) {
        return UserConditionResponse.builder()
                .id(uc.getId())
                .userId(uc.getUserId())
                .incomeLevel(uc.getIncomeLevel())
                .employmentStatus(uc.getEmploymentStatus())
                .region(uc.getRegion())
                .updatedAt(uc.getUpdatedAt())
                .build();
    }
}
