package com.cashbook.domain.transaction.service;

import com.cashbook.domain.transaction.dto.TransactionCreateRequest;
import com.cashbook.domain.transaction.dto.TransactionPageResponse;
import com.cashbook.domain.transaction.dto.TransactionResponse;
import com.cashbook.domain.transaction.dto.TransactionSummaryResponse;
import com.cashbook.domain.transaction.dto.TransactionUpdateRequest;
import com.cashbook.domain.transaction.entity.Transaction;
import com.cashbook.domain.transaction.mapper.TransactionMapper;
import com.cashbook.exception.BusinessException;
import com.cashbook.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionMapper transactionMapper;

    /** 거래내역 등록 */
    @Transactional
    public TransactionResponse create(Long userId, TransactionCreateRequest req) {
        // 타입 검증
        if (!req.getType().equals("INCOME") && !req.getType().equals("EXPENSE")) {
            throw new BusinessException(ErrorCode.INVALID_TYPE);
        }

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .categoryId(req.getCategoryId())
                .assetId(req.getAssetId())
                .type(req.getType())
                .amount(req.getAmount())
                .memo(req.getMemo())
                .txnDate(req.getTxnDate())
                .build();

        transactionMapper.insert(transaction);

        // 생성 후 단건 조회 (createdAt, categoryName 포함 반환)
        LocalDate date = req.getTxnDate();
        List<TransactionResponse> result = transactionMapper.findByUserIdAndMonth(
                userId, date, date, 1, 0
        );
        return result.isEmpty() ? null : result.get(0);
    }

    /** 월별 거래내역 목록 조회 */
    @Transactional(readOnly = true)
    public TransactionPageResponse getTransactions(Long userId, int year, int month,
                                                   int page, int size) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate   = ym.atEndOfMonth();
        int offset = page * size;

        List<TransactionResponse> content = transactionMapper.findByUserIdAndMonth(
                userId, startDate, endDate, size, offset
        );
        long totalCount = transactionMapper.countByUserIdAndMonth(userId, startDate, endDate);
        int totalPages = (int) Math.ceil((double) totalCount / size);

        return TransactionPageResponse.builder()
                .content(content)
                .totalCount(totalCount)
                .page(page)
                .size(size)
                .totalPages(totalPages)
                .build();
    }

    /** 거래내역 수정 */
    @Transactional
    public TransactionResponse update(Long userId, Long id, TransactionUpdateRequest req) {
        if (!req.getType().equals("INCOME") && !req.getType().equals("EXPENSE")) {
            throw new BusinessException(ErrorCode.INVALID_TYPE);
        }

        Transaction transaction = Transaction.builder()
                .id(id)
                .userId(userId)
                .categoryId(req.getCategoryId())
                .assetId(req.getAssetId())
                .type(req.getType())
                .amount(req.getAmount())
                .memo(req.getMemo())
                .txnDate(req.getTxnDate())
                .build();

        int updated = transactionMapper.update(transaction);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND);
        }

        // 수정된 항목을 다시 조회해 categoryName 등 JOIN 데이터 포함 반환
        LocalDate date = req.getTxnDate();
        List<TransactionResponse> result = transactionMapper.findByUserIdAndMonth(
                userId, date, date, 1, 0
        );
        return result.isEmpty() ? null : result.get(0);
    }

    /** 월별 수입/지출 요약 */
    @Transactional(readOnly = true)
    public TransactionSummaryResponse getSummary(Long userId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate   = ym.atEndOfMonth();
        return transactionMapper.getSummary(userId, startDate, endDate, year, month);
    }

    /** 거래내역 Soft Delete */
    @Transactional
    public void delete(Long userId, Long id) {
        int updated = transactionMapper.softDelete(id, userId);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.TRANSACTION_NOT_FOUND);
        }
    }
}
