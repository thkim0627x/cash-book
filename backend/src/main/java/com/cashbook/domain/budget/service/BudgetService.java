package com.cashbook.domain.budget.service;

import com.cashbook.domain.budget.dto.BudgetCreateRequest;
import com.cashbook.domain.budget.dto.BudgetResponse;
import com.cashbook.domain.budget.dto.BudgetUpdateRequest;
import com.cashbook.domain.budget.entity.Budget;
import com.cashbook.domain.budget.mapper.BudgetMapper;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetMapper budgetMapper;

    // ──────────────────────────────────────────────────────
    // 생성
    // ──────────────────────────────────────────────────────

    /**
     * 예산 설정
     * 같은 userId + categoryId + yearMonth 중복 불가
     */
    @Transactional
    public BudgetResponse create(Long userId, BudgetCreateRequest req) {
        // 중복 체크 (category_id = NULL 포함)
        if (budgetMapper.countDuplicate(userId, req.getCategoryId(), req.getYearMonth()) > 0) {
            throw new BusinessException(ErrorCode.BUDGET_DUPLICATE);
        }

        Budget budget = Budget.builder()
                .userId(userId)
                .categoryId(req.getCategoryId())
                .amount(req.getAmount())
                .yearMonth(req.getYearMonth())
                .build();

        budgetMapper.insert(budget);

        // 생성 직후 조회해 실제지출/남은금액 포함한 응답 반환
        List<BudgetResponse> result = budgetMapper.findByUserIdAndMonth(userId, req.getYearMonth());
        return result.stream()
                .filter(b -> b.getId().equals(budget.getId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.BUDGET_NOT_FOUND));
    }

    // ──────────────────────────────────────────────────────
    // 조회
    // ──────────────────────────────────────────────────────

    /**
     * 월별 예산 목록 조회 (실제지출 포함)
     * year_month 파라미터 예: "2026-06"
     */
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Long userId, String yearMonth) {
        return budgetMapper.findByUserIdAndMonth(userId, yearMonth);
    }

    // ──────────────────────────────────────────────────────
    // 수정
    // ──────────────────────────────────────────────────────

    /** 예산 금액 수정 */
    @Transactional
    public BudgetResponse update(Long userId, Long id, BudgetUpdateRequest req) {
        // 소유권 확인
        Budget existing = budgetMapper.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUDGET_NOT_FOUND));

        int rows = budgetMapper.update(id, userId, req.getAmount());
        if (rows == 0) throw new BusinessException(ErrorCode.BUDGET_NOT_FOUND);

        // 수정 후 최신 상태로 응답
        List<BudgetResponse> result = budgetMapper.findByUserIdAndMonth(userId, existing.getYearMonth());
        return result.stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.BUDGET_NOT_FOUND));
    }

    // ──────────────────────────────────────────────────────
    // 삭제
    // ──────────────────────────────────────────────────────

    /** 예산 Soft Delete */
    @Transactional
    public void delete(Long userId, Long id) {
        // 소유권 확인
        budgetMapper.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUDGET_NOT_FOUND));

        int rows = budgetMapper.softDelete(id, userId);
        if (rows == 0) throw new BusinessException(ErrorCode.BUDGET_NOT_FOUND);
    }
}
