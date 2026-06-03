package com.cashbook.domain.notification.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 알림 엔티티.
 * updated_at, deleted_at 없음 (is_read 업데이트만 발생).
 * type: BUDGET_ALERT | BENEFIT_DEADLINE | COMMUNITY_COMMENT
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String message;
    private boolean isRead;
    private String link;
    private OffsetDateTime createdAt;
}
