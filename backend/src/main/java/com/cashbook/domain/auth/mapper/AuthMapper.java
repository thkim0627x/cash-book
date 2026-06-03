package com.cashbook.domain.auth.mapper;

import com.cashbook.domain.auth.entity.RefreshToken;
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

    /** userId로 저장된 Refresh Token 조회 (재발급 검증용) */
    Optional<RefreshToken> findRefreshTokenByUserId(Long userId);

    /** 로그아웃 시 Refresh Token 삭제 */
    void deleteRefreshTokenByUserId(Long userId);

    /**
     * 회원 정보(name, birth_year) 수정.
     * email/password/role 은 변경 불가.
     * @return 영향받은 행 수 (0이면 대상 없음)
     */
    int updateProfile(@Param("userId") Long userId,
                      @Param("name") String name,
                      @Param("birthYear") Short birthYear);

    /**
     * 비밀번호 변경 (BCrypt 해시 저장).
     * @return 영향받은 행 수
     */
    int updatePassword(@Param("userId") Long userId,
                       @Param("password") String password);
}
