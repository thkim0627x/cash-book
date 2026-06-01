package com.cashbook.domain.statistics.mapper;

import com.cashbook.domain.statistics.dto.CategoryStatItem;
import com.cashbook.domain.statistics.dto.TrendItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface StatisticsMapper {

    /**
     * 카테고리별 지출 금액 + 비율 조회
     * - EXPENSE 타입만 집계
     * - SQL 윈도우 함수(OVER)로 ratio 계산 → N+1 없음
     * - 금액 내림차순 정렬
     */
    List<CategoryStatItem> findCategoryStats(
            @Param("userId")    Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate
    );

    /**
     * 최근 N개월 수입/지출 추이
     * - generate_series 로 거래 없는 달도 0으로 채움
     * - yearMonth ASC 정렬 (차트용)
     */
    List<TrendItem> findMonthlyTrend(
            @Param("userId")    Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate")   LocalDate endDate
    );
}
