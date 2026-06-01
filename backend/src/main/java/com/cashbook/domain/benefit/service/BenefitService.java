package com.cashbook.domain.benefit.service;

import com.cashbook.domain.auth.entity.User;
import com.cashbook.domain.auth.mapper.AuthMapper;
import com.cashbook.domain.benefit.dto.BenefitDetailResponse;
import com.cashbook.domain.benefit.dto.BenefitPageResponse;
import com.cashbook.domain.benefit.dto.BenefitResponse;
import com.cashbook.domain.benefit.mapper.BenefitMapper;
import com.cashbook.domain.usercondition.mapper.UserConditionMapper;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BenefitService {

    private final BenefitMapper       benefitMapper;
    private final AuthMapper           authMapper;
    private final UserConditionMapper  userConditionMapper;

    // ──────────────────────────────────────────────────────
    // 목록 조회
    // ──────────────────────────────────────────────────────

    /**
     * 혜택 목록 조회 (동적 필터 + 페이지네이션)
     * expired 필드는 SQL CASE WHEN 으로 계산됨 (서비스 가공 불필요)
     */
    @Transactional(readOnly = true)
    public BenefitPageResponse getBenefits(String category, Integer age,
                                            boolean includeExpired, int page, int size) {
        int offset = page * size;
        List<BenefitResponse> content =
                benefitMapper.findAll(category, age, includeExpired, size, offset);
        long totalCount = benefitMapper.countAll(category, age, includeExpired);

        return BenefitPageResponse.builder()
                .content(content)
                .totalCount(totalCount)
                .page(page)
                .size(size)
                .totalPages((int) Math.ceil((double) totalCount / size))
                .build();
    }

    // ──────────────────────────────────────────────────────
    // 상세 조회
    // ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public BenefitDetailResponse getBenefitDetail(Long id) {
        return benefitMapper.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BENEFIT_NOT_FOUND));
    }

    // ──────────────────────────────────────────────────────
    // 추천 목록
    // ──────────────────────────────────────────────────────

    /**
     * 조건 기반 추천 혜택
     * ① users.birth_year → 현재 나이 계산
     * ② user_conditions 등록 여부 확인 (미등록 시 404 안내)
     * ③ 나이 범위 매칭 + 마감 미경과 + 마감 임박순 정렬
     *
     * birth_year = NULL 이면 age=-1 → SQL에서 나이 필터 건너뜀
     */
    @Transactional(readOnly = true)
    public List<BenefitResponse> getRecommended(Long userId) {
        User user = authMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 조건 미등록 시 안내
        userConditionMapper.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_CONDITION_NOT_FOUND));

        int age = (user.getBirthYear() != null)
                ? LocalDate.now().getYear() - user.getBirthYear()
                : -1;  // -1 → SQL에서 나이 필터 스킵

        return benefitMapper.findRecommended(age);
    }
}
