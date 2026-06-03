package com.cashbook.domain.auth.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * Access Token 재발급 응답.
 * Refresh Token은 그대로 재사용하므로 새 Access Token만 반환.
 */
@Getter
@Builder
public class ReissueResponse {
    private String accessToken;
}
