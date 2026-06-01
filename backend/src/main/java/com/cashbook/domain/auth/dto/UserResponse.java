package com.cashbook.domain.auth.dto;

import com.cashbook.domain.auth.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private Short birthYear;
    private String role;
    private OffsetDateTime createdAt;

    /** Entity → DTO 변환 (password 필드 제외) */
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .birthYear(user.getBirthYear())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
