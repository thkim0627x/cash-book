package com.cashbook.domain.notification.dto;

import lombok.Builder;
import lombok.Getter;

/** 미읽음 알림 개수 — 헤더 배지용 */
@Getter
@Builder
public class UnreadCountResponse {
    private long count;
}
