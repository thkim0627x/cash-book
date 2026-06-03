package com.cashbook.domain.user.service;

import com.cashbook.domain.auth.dto.UserResponse;
import com.cashbook.domain.auth.entity.User;
import com.cashbook.domain.auth.mapper.AuthMapper;
import com.cashbook.domain.user.dto.UpdatePasswordRequest;
import com.cashbook.domain.user.dto.UpdateProfileRequest;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 회원 정보 관리 서비스.
 * User 엔티티/매퍼는 auth 도메인 것을 재사용 (중복 정의 방지).
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원 정보(name, birth_year) 수정.
     * 이메일은 변경 불가.
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        int updated = authMapper.updateProfile(userId, req.getName(), req.getBirthYear());
        if (updated == 0) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        User user = authMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }

    /**
     * 비밀번호 변경.
     * 현재 비밀번호 BCrypt 검증 후 새 비밀번호로 교체.
     */
    @Transactional
    public void updatePassword(Long userId, UpdatePasswordRequest req) {
        User user = authMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다.");
        }

        authMapper.updatePassword(userId, passwordEncoder.encode(req.getNewPassword()));
    }
}
