package com.cashbook.domain.auth.entity;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

/**
 * refresh_tokens 테이블 매핑 엔티티.
 * 재발급(reissue) 시 DB 저장 토큰과의 일치/만료 검증에 사용.
 */
@Getter
@Builder
public class RefreshToken {
    private Long id;
    private Long userId;
    private String token;
    private OffsetDateTime expiresAt;
    private OffsetDateTime createdAt;
}
