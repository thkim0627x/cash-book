package com.cashbook.domain.budget.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.budget.dto.BudgetCreateRequest;
import com.cashbook.domain.budget.dto.BudgetResponse;
import com.cashbook.domain.budget.dto.BudgetUpdateRequest;
import com.cashbook.domain.budget.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /** POST /api/budgets — 예산 설정 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BudgetResponse> create(@RequestBody @Valid BudgetCreateRequest req) {
        return ApiResponse.ok("예산이 설정되었습니다.", budgetService.create(currentUserId(), req));
    }

    /**
     * GET /api/budgets?year_month=2026-06
     * 월별 예산 목록 조회 (실제지출 포함)
     * year_month 미입력 시 현재 월 기본값 적용
     */
    @GetMapping
    public ApiResponse<List<BudgetResponse>> getBudgets(
            @RequestParam(name = "year_month", required = false) String yearMonth
    ) {
        if (yearMonth == null || yearMonth.isBlank()) {
            yearMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return ApiResponse.ok(budgetService.getBudgets(currentUserId(), yearMonth));
    }

    /** PUT /api/budgets/{id} — 예산 금액 수정 */
    @PutMapping("/{id}")
    public ApiResponse<BudgetResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid BudgetUpdateRequest req
    ) {
        return ApiResponse.ok("예산이 수정되었습니다.", budgetService.update(currentUserId(), id, req));
    }

    /** DELETE /api/budgets/{id} — 예산 삭제 (Soft Delete) */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        budgetService.delete(currentUserId(), id);
        return ApiResponse.ok("예산이 삭제되었습니다.");
    }

    // ──────────────────────────────
    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
