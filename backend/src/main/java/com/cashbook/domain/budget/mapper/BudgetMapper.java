package com.cashbook.domain.budget.mapper;

import com.cashbook.domain.budget.dto.BudgetResponse;
import com.cashbook.domain.budget.entity.Budget;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface BudgetMapper {

    /**
     * 예산 등록
     * useGeneratedKeys로 id 자동 주입
     */
    void insert(Budget budget);

    /**
     * 월별 예산 목록 조회 (실제지출 포함)
     * categories LEFT JOIN + transactions CTE SUM
     */
    List<BudgetResponse> findByUserIdAndMonth(
            @Param("userId")    Long userId,
            @Param("yearMonth") String yearMonth
    );

    /**
     * ID + userId로 단건 조회 — 소유권 확인용
     */
    Optional<Budget> findByIdAndUserId(
            @Param("id")     Long id,
            @Param("userId") Long userId
    );

    /**
     * 중복 예산 존재 여부 (같은 userId + categoryId + yearMonth)
     * category_id NULL 허용이므로 COALESCE(-1) 처리
     */
    int countDuplicate(
            @Param("userId")     Long userId,
            @Param("categoryId") Long categoryId,
            @Param("yearMonth")  String yearMonth
    );

    /**
     * 예산 금액 수정
     * @return 업데이트된 행 수
     */
    int update(@Param("id")     Long id,
               @Param("userId") Long userId,
               @Param("amount") java.math.BigDecimal amount);

    /**
     * 예산 Soft Delete (본인 소유 검증 포함)
     * @return 업데이트된 행 수
     */
    int softDelete(@Param("id") Long id, @Param("userId") Long userId);
}
