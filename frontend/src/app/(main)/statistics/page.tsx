'use client'
import { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Divider,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material'
import { useQueries } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import { MonthlyBarChart, type MonthlyData } from '@/features/statistics/MonthlyBarChart'
import { CategoryDonutChart, type CategorySlice } from '@/features/statistics/CategoryDonutChart'
import { TopCategoryList } from '@/features/statistics/TopCategoryList'
import type { Transaction } from '@/types/transaction'

// ── 유틸 ─────────────────────────────────────────────────────────────
/** 오늘 기준 과거 N개월 {year, month} 배열 생성 (최신 → 오래된 순) */
function getRecentMonths(n: number): { year: number; month: number }[] {
  const result: { year: number; month: number }[] = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  return result
}

function monthLabel(year: number, month: number) {
  return `${String(year).slice(2)}.${String(month).padStart(2, '0')}`
}

/** Transaction[] → 카테고리별 지출 슬라이스 (내림차순) */
function buildCategorySlices(transactions: Transaction[]): CategorySlice[] {
  const map: Record<number, CategorySlice> = {}
  const expenseTotal = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)

  for (const t of transactions) {
    if (t.type !== 'EXPENSE') continue
    if (!map[t.categoryId]) {
      map[t.categoryId] = {
        categoryId: t.categoryId,
        categoryName: t.categoryName,
        categoryColor: t.categoryColor,
        amount: 0,
        percentage: 0,
      }
    }
    map[t.categoryId].amount += t.amount
  }

  return Object.values(map)
    .sort((a, b) => b.amount - a.amount)
    .map((s) => ({
      ...s,
      percentage: expenseTotal > 0 ? (s.amount / expenseTotal) * 100 : 0,
    }))
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────
export default function StatisticsPage() {
  const recentMonths = useMemo(() => getRecentMonths(6), [])
  const currentMonth = recentMonths[0]

  // 최근 6개월 병렬 패칭
  const monthQueries = useQueries({
    queries: recentMonths.map(({ year, month }) => ({
      queryKey: ['transactions', year, month],
      queryFn: () => transactionService.getList({ year, month, size: 500 }),
      staleTime: 1000 * 60 * 5,
    })),
  })

  const isLoading = monthQueries.some((q) => q.isLoading)
  const isError = monthQueries.some((q) => q.isError)

  // ── 월별 수입/지출 집계 ────────────────────────────────────────────
  const monthlyData: MonthlyData[] = useMemo(() => {
    return recentMonths
      .map(({ year, month }, idx) => {
        const transactions = monthQueries[idx].data?.data?.content ?? []
        const summary = transactionService.getSummary(transactions)
        return {
          label: monthLabel(year, month),
          income: summary.totalIncome,
          expense: summary.totalExpense,
        }
      })
      .reverse() // 오래된 → 최신 순으로 차트 표시
  }, [recentMonths, monthQueries])

  // ── 이번 달 카테고리 슬라이스 ─────────────────────────────────────
  const currentTransactions = monthQueries[0].data?.data?.content ?? []
  const categorySlices = useMemo(
    () => buildCategorySlices(currentTransactions),
    [currentTransactions]
  )
  const currentSummary = useMemo(
    () => transactionService.getSummary(currentTransactions),
    [currentTransactions]
  )

  // ── 6개월 누계 집계 ───────────────────────────────────────────────
  const totalSummary = useMemo(() => {
    const all = monthQueries.flatMap((q) => q.data?.data?.content ?? [])
    return transactionService.getSummary(all)
  }, [monthQueries])

  // ── 렌더 ─────────────────────────────────────────────────────────
  return (
    <Box>
      {/* 페이지 타이틀 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          통계
        </Typography>
        <Typography variant="body2" color="text.secondary">
          최근 6개월 ({monthLabel(recentMonths[5].year, recentMonths[5].month)} ~ {monthLabel(currentMonth.year, currentMonth.month)})
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* ── Row 1: 6개월 누계 요약 카드 ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: '6개월 총 수입', value: totalSummary.totalIncome, color: 'success.main', prefix: '+' },
          { label: '6개월 총 지출', value: totalSummary.totalExpense, color: 'error.main', prefix: '-' },
          { label: '6개월 순수익', value: totalSummary.balance, color: totalSummary.balance >= 0 ? 'primary.main' : 'error.main', prefix: '' },
        ].map(({ label, value, color, prefix }) => (
          <Grid key={label} size={{ xs: 12, sm: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  {label}
                </Typography>
                {isLoading ? (
                  <Skeleton height={32} />
                ) : (
                  <Typography variant="h6" fontWeight={700} sx={{ color }}>
                    {prefix}{value.toLocaleString('ko-KR')}원
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Row 2: 월별 수입/지출 막대 차트 ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6">월별 수입 / 지출 추이</Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label="수입"
                sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: 11 }}
              />
              <Chip
                size="small"
                label="지출"
                sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 600, fontSize: 11 }}
              />
            </Stack>
          </Stack>
          <MonthlyBarChart data={monthlyData} loading={isLoading} />
        </CardContent>
      </Card>

      {/* ── Row 3: 도넛 차트 + Top 카테고리 ── */}
      <Grid container spacing={3}>
        {/* 이번달 카테고리별 지출 도넛 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">이번달 지출 비율</Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentMonth.year}년 {currentMonth.month}월
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                  <Skeleton variant="circular" width={180} height={180} />
                </Box>
              ) : (
                <CategoryDonutChart
                  data={categorySlices}
                  totalExpense={currentSummary.totalExpense}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 상위 지출 카테고리 순위 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">상위 지출 카테고리</Typography>
                <Typography variant="caption" color="text.secondary">
                  이번달 기준
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {isLoading ? (
                <Stack spacing={1.5}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rounded" height={44} />
                  ))}
                </Stack>
              ) : (
                <TopCategoryList data={categorySlices} topN={5} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Row 4: 이번달 상세 통계 ── */}
      {!isLoading && currentTransactions.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              이번달 카테고리별 지출 상세
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ overflowX: 'auto' }}>
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    py: 1.25,
                    px: 1.5,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid',
                    borderColor: 'grey.200',
                  },
                  '& th': {
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    bgcolor: 'grey.50',
                  },
                  '& tr:last-child td': { borderBottom: 'none' },
                  '& tr:hover td': { bgcolor: 'action.hover' },
                }}
              >
                <thead>
                  <tr>
                    <th>카테고리</th>
                    <th style={{ textAlign: 'right' }}>건수</th>
                    <th style={{ textAlign: 'right' }}>합계</th>
                    <th style={{ textAlign: 'right' }}>비율</th>
                  </tr>
                </thead>
                <tbody>
                  {categorySlices.map((s) => {
                    const count = currentTransactions.filter(
                      (t) => t.categoryId === s.categoryId && t.type === 'EXPENSE'
                    ).length
                    return (
                      <tr key={s.categoryId}>
                        <td>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: s.categoryColor ?? '#C62828',
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" fontWeight={500}>
                              {s.categoryName}
                            </Typography>
                          </Stack>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            {count}건
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Typography variant="body2" fontWeight={600} color="error.main">
                            {s.amount.toLocaleString('ko-KR')}원
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            {s.percentage.toFixed(1)}%
                          </Typography>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
