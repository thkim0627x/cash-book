package com.cashbook.domain.statistics.service;

import com.cashbook.domain.statistics.dto.CategoryStatItem;
import com.cashbook.domain.statistics.dto.CategoryStatResponse;
import com.cashbook.domain.statistics.dto.TrendItem;
import com.cashbook.domain.statistics.mapper.StatisticsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final StatisticsMapper statisticsMapper;

    // ──────────────────────────────────────────────────────
    // 카테고리별 지출 통계
    // ──────────────────────────────────────────────────────

    /**
     * 특정 월의 카테고리별 지출 금액 + 비율
     * ratio는 SQL 윈도우 함수로 계산됨
     */
    @Transactional(readOnly = true)
    public CategoryStatResponse getCategoryStats(Long userId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate   = ym.atEndOfMonth();

        List<CategoryStatItem> items =
                statisticsMapper.findCategoryStats(userId, startDate, endDate);

        // totalExpense = 전체 항목 금액 합산
        BigDecimal totalExpense = items.stream()
                .map(CategoryStatItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CategoryStatResponse.builder()
                .year(year)
                .month(month)
                .totalExpense(totalExpense)
                .items(items)
                .build();
    }

    // ──────────────────────────────────────────────────────
    // 월별 수입/지출 추이
    // ──────────────────────────────────────────────────────

    /**
     * 최근 months개월 수입/지출 추이
     * generate_series로 데이터 없는 달도 0으로 반환 → 차트 바로 사용 가능
     *
     * @param months 1~24 (기본 6)
     */
    @Transactional(readOnly = true)
    public List<TrendItem> getMonthlyTrend(Long userId, int months) {
        // 현재 월 기준으로 N개월 전 ~ 이번 달
        YearMonth endYm   = YearMonth.now();
        YearMonth startYm = endYm.minusMonths(months - 1L);

        LocalDate startDate = startYm.atDay(1);
        LocalDate endDate   = endYm.atEndOfMonth();

        return statisticsMapper.findMonthlyTrend(userId, startDate, endDate);
    }
}
