package com.cashbook.domain.benefit.mapper;

import com.cashbook.domain.benefit.dto.BenefitDetailResponse;
import com.cashbook.domain.benefit.dto.BenefitResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface BenefitMapper {

    /**
     * 혜택 목록 조회 (동적 필터링 + 페이지네이션)
     * - category: 분류 필터 (NULL = 전체)
     * - age: 나이 필터 (NULL = 전체, 범위 포함 여부 체크)
     * - includeExpired: false → 마감 지난 혜택 제외
     */
    List<BenefitResponse> findAll(
            @Param("category")       String category,
            @Param("age")            Integer age,
            @Param("includeExpired") boolean includeExpired,
            @Param("limit")          int limit,
            @Param("offset")         int offset
    );

    /** 목록 총 건수 (페이지네이션 계산용) */
    long countAll(
            @Param("category")       String category,
            @Param("age")            Integer age,
            @Param("includeExpired") boolean includeExpired
    );

    /** 혜택 상세 조회 */
    Optional<BenefitDetailResponse> findById(Long id);

    /**
     * 조건 기반 추천 목록 (상위 20건)
     * - 나이 범위 매칭 + 마감 미경과 + 마감 임박순 정렬
     */
    List<BenefitResponse> findRecommended(
            @Param("age") int age
    );
}
