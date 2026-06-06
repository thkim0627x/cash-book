package com.cashbook.domain.transaction.controller;

import com.cashbook.common.ApiResponse;
import com.cashbook.domain.transaction.dto.TransactionCreateRequest;
import com.cashbook.domain.transaction.dto.TransactionPageResponse;
import com.cashbook.domain.transaction.dto.TransactionResponse;
import com.cashbook.domain.transaction.dto.TransactionSummaryResponse;
import com.cashbook.domain.transaction.dto.TransactionUpdateRequest;
import com.cashbook.domain.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /** POST /api/transactions — 거래내역 등록 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TransactionResponse> create(@RequestBody @Valid TransactionCreateRequest req) {
        Long userId = currentUserId();
        TransactionResponse response = transactionService.create(userId, req);
        return ApiResponse.ok("거래내역이 등록되었습니다.", response);
    }

    /**
     * GET /api/transactions?year=2026&month=6&page=0&size=20
     * 월별 거래내역 목록 조회
     */
    @GetMapping
    public ApiResponse<TransactionPageResponse> getTransactions(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        // 파라미터 미입력 시 현재 년/월 기본값 적용
        if (year  == null) year  = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        Long userId = currentUserId();
        TransactionPageResponse result = transactionService.getTransactions(userId, year, month, page, size);
        return ApiResponse.ok(result);
    }

    /**
     * GET /api/transactions/summary?year=2026&month=6
     * 월별 수입합계/지출합계/잔액 반환
     * NOTE: 리터럴 경로 /summary 가 /{id} 보다 우선 매핑됨
     */
    @GetMapping("/summary")
    public ApiResponse<TransactionSummaryResponse> getSummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        if (year  == null) year  = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        Long userId = currentUserId();
        return ApiResponse.ok(transactionService.getSummary(userId, year, month));
    }

    /** GET /api/transactions/summary/alltime — 전체기간 수입/지출 요약 */
    @GetMapping("/summary/alltime")
    public ApiResponse<TransactionSummaryResponse> getAllTimeSummary() {
        Long userId = currentUserId();
        return ApiResponse.ok(transactionService.getAllTimeSummary(userId));
    }

    /** PUT /api/transactions/{id} — 거래내역 수정 */
    @PutMapping("/{id}")
    public ApiResponse<TransactionResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid TransactionUpdateRequest req
    ) {
        Long userId = currentUserId();
        TransactionResponse response = transactionService.update(userId, id, req);
        return ApiResponse.ok("거래내역이 수정되었습니다.", response);
    }

    /** DELETE /api/transactions/{id} — 거래내역 Soft Delete */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Long userId = currentUserId();
        transactionService.delete(userId, id);
        return ApiResponse.ok("거래내역이 삭제되었습니다.");
    }

    // ──────────────────────────────
    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
