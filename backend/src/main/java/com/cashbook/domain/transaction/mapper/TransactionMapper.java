package com.cashbook.domain.transaction.mapper;

import com.cashbook.domain.transaction.dto.TransactionResponse;
import com.cashbook.domain.transaction.dto.TransactionSummaryResponse;
import com.cashbook.domain.transaction.entity.Transaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface TransactionMapper {

    /** 거래내역 등록 */
    void insert(Transaction transaction);

    /**
     * 월별 거래내역 목록 조회 (categories JOIN, N+1 방지)
     * Soft Delete 제외, 날짜 DESC 정렬, LIMIT/OFFSET 페이지네이션
     */
    List<TransactionResponse> findByUserIdAndMonth(
            @Param("userId")    Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate,
            @Param("limit")     int limit,
            @Param("offset")    int offset
    );

    /** 월별 거래내역 총 건수 (페이지네이션 계산용) */
    long countByUserIdAndMonth(
            @Param("userId")    Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate
    );

    /**
     * 거래내역 수정 (본인 소유 검증 포함)
     * @return 업데이트된 행 수 (0이면 not found 또는 forbidden)
     */
    int update(Transaction transaction);

    /**
     * 월별 수입/지출 요약 (SUM 집계)
     */
    TransactionSummaryResponse getSummary(
            @Param("userId")    Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate,
            @Param("year")      int year,
            @Param("month")     int month
    );

    /**
     * Soft Delete — 자기 소유 거래내역만 삭제 가능 (userId 조건 포함)
     * @return 업데이트된 행 수 (0이면 not found 또는 forbidden)
     */
    int softDelete(
            @Param("id")     Long id,
            @Param("userId") Long userId
    );
}
