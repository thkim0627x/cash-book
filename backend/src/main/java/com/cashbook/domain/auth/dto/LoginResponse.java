package com.cashbook.domain.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private Long userId;
    private String name;
    private String accessToken;
    private String refreshToken;
}
