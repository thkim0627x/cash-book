package com.cashbook.domain.auth.mapper;

import com.cashbook.domain.auth.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

@Mapper
public interface AuthMapper {

    /** 회원 등록 — useGeneratedKeys로 id 자동 주입 */
    void insertUser(User user);

    /** 이메일로 사용자 조회 (Soft Delete 제외) */
    Optional<User> findByEmail(String email);

    /** ID로 사용자 조회 (Soft Delete 제외) */
    Optional<User> findById(Long id);

    /** Refresh Token 저장 (upsert — 기존 토큰 삭제 후 삽입) */
    void upsertRefreshToken(@Param("userId") Long userId,
                            @Param("token") String token,
                            @Param("expiresAt") OffsetDateTime expiresAt);

    /** 로그아웃 시 Refresh Token 삭제 */
    void deleteRefreshTokenByUserId(Long userId);
}
