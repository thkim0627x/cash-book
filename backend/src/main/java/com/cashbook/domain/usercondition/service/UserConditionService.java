package com.cashbook.domain.usercondition.service;

import com.cashbook.domain.usercondition.dto.UserConditionRequest;
import com.cashbook.domain.usercondition.dto.UserConditionResponse;
import com.cashbook.domain.usercondition.entity.UserCondition;
import com.cashbook.domain.usercondition.mapper.UserConditionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserConditionService {

    private final UserConditionMapper userConditionMapper;

    /**
     * 사용자 조건 저장 (upsert).
     * 이미 존재하면 UPDATE, 없으면 INSERT.
     * null 필드는 SQL <if> 로 기존값 유지 처리 → 부분 업데이트 지원.
     */
    @Transactional
    public UserConditionResponse save(Long userId, UserConditionRequest req) {
        UserCondition uc = UserCondition.builder()
                .userId(userId)
                .incomeLevel(req.getIncomeLevel())
                .employmentStatus(req.getEmploymentStatus())
                .region(req.getRegion())
                .build();

        userConditionMapper.upsert(uc);

        // upsert 후 최신 상태 반환
        UserCondition saved = userConditionMapper.findByUserId(userId).orElseThrow();
        return UserConditionResponse.from(saved);
    }

    /** 현재 사용자 조건 조회 */
    @Transactional(readOnly = true)
    public UserConditionResponse getMyCondition(Long userId) {
        return userConditionMapper.findByUserId(userId)
                .map(UserConditionResponse::from)
                .orElse(null);   // 미등록 시 null (프론트에서 빈 폼 표시)
    }
}
