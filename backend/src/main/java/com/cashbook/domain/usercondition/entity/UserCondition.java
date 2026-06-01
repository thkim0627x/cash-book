package com.cashbook.domain.usercondition.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 사용자 복지 조건 엔티티.
 * 유저당 1행만 존재 (UNIQUE user_id).
 * deleted_at 없음 — UPDATE 전용.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCondition {
    private Long id;
    private Long userId;
    private String incomeLevel;        // LOW | MIDDLE | HIGH
    private String employmentStatus;   // EMPLOYED | UNEMPLOYED | FREELANCE | STUDENT
    private String region;             // 서울 | 경기 | ...
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
