package com.cashbook.domain.auth.entity;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class User {
    private Long id;
    private String email;
    private String password;
    private String name;
    private Short birthYear;
    private String role;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
