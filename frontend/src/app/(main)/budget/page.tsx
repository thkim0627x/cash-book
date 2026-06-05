'use client'
import { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Alert,
  LinearProgress,
  Grid,
  Divider,
  Skeleton,
} from '@mui/material'
import { Plus } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetService } from '@/services/budget.service'
import { transactionService } from '@/services/transaction.service'
import { BudgetProgressBar } from '@/features/budget/BudgetProgressBar'
import { BudgetForm } from '@/features/budget/BudgetForm'
import { MonthPicker } from '@/components/common/MonthPicker'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { useToastStore } from '@/stores/toastStore'
import type { BudgetWithUsage } from '@/types/budget'

export default function BudgetPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BudgetWithUsage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()

  // ── 데이터 패칭 ──────────────────────────────────────────────────
  const {
    data: budgetRes,
    isLoading: budgetLoading,
    isError: budgetError,
  } = useQuery({
    queryKey: ['budgets', year, month],
    queryFn: () => budgetService.getList(year, month),
  })

  const {
    data: txnRes,
    isLoading: txnLoading,
  } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })

  const isLoading = budgetLoading || txnLoading

  // ── 예산 + 실지출 결합 ────────────────────────────────────────────
  const budgetsWithUsage: BudgetWithUsage[] = useMemo(() => {
    const budgets = budgetRes?.data ?? []
    const transactions = txnRes?.data?.content ?? []

    // 카테고리별 지출 합계 맵
    const expenseMap: Record<number, number> = {}
    for (const t of transactions) {
      if (t.type === 'EXPENSE') {
        expenseMap[t.categoryId] = (expenseMap[t.categoryId] ?? 0) + t.amount
      }
    }

    return budgets.map((b) => {
      const used = expenseMap[b.categoryId] ?? 0
      const pct = b.amount > 0 ? (used / b.amount) * 100 : 0
      return {
        ...b,
        usedAmount: used,
        percentage: pct,
        isOver: pct >= 100,
      }
    })
  }, [budgetRes, txnRes])

  // ── 전체 요약 집계 ───────────────────────────────────────────────
  const totalSummary = useMemo(() => {
    const totalLimit = budgetsWithUsage.reduce((s, b) => s + b.amount, 0)
    const totalUsed = budgetsWithUsage.reduce((s, b) => s + b.usedAmount, 0)
    const overCount = budgetsWithUsage.filter((b) => b.isOver).length
    const totalPct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0
    return { totalLimit, totalUsed, totalRemaining: totalLimit - totalUsed, totalPct, overCount }
  }, [budgetsWithUsage])

  // ── 삭제 ─────────────────────────────────────────────────────────
  const { mutate: deleteBudget, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => budgetService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['budgets', year, month] })
      showToast('예산이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const existingCategoryIds = budgetsWithUsage.map((b) => b.categoryId)

  const handleEditClick = (budget: BudgetWithUsage) => {
    setEditTarget(budget)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditTarget(null)
  }

  const handleMonthChange = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
  }

  // ── 렌더 ─────────────────────────────────────────────────────────
  return (
    <Box>
      {/* 페이지 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <MonthPicker year={year} month={month} onChange={handleMonthChange} />
        <Button
          variant="contained"
          startIcon={<Plus weight="bold" />}
          onClick={() => setFormOpen(true)}
          disabled={isLoading}
        >
          예산 추가
        </Button>
      </Box>

      {(budgetError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          예산 데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* 전체 예산 요약 카드 */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {year}년 {month}월 예산 현황
          </Typography>

          {isLoading ? (
            <>
              <Skeleton height={24} sx={{ mb: 1 }} />
              <Skeleton height={12} sx={{ borderRadius: 2 }} />
            </>
          ) : budgetsWithUsage.length === 0 ? null : (
            <>
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      총 예산
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {totalSummary.totalLimit.toLocaleString('ko-KR')}원
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      사용액
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main">
                      {totalSummary.totalUsed.toLocaleString('ko-KR')}원
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      잔여
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={totalSummary.totalRemaining >= 0 ? 'success.main' : 'error.main'}
                    >
                      {totalSummary.totalRemaining.toLocaleString('ko-KR')}원
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Stack direction="row" alignItems="center" spacing={1.5}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(totalSummary.totalPct, 100)}
                  color={
                    totalSummary.totalPct >= 100
                      ? 'error'
                      : totalSummary.totalPct >= 80
                      ? 'warning'
                      : 'primary'
                  }
                  sx={{ flex: 1, height: 10, borderRadius: 5 }}
                />
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={
                    totalSummary.totalPct >= 100
                      ? 'error.main'
                      : totalSummary.totalPct >= 80
                      ? 'warning.main'
                      : 'primary.main'
                  }
                  sx={{ minWidth: 44 }}
                >
                  {Math.round(totalSummary.totalPct)}%
                </Typography>
              </Stack>

              {totalSummary.overCount > 0 && (
                <Alert severity="error" sx={{ mt: 2 }} variant="outlined">
                  <strong>{totalSummary.overCount}개</strong> 카테고리의 예산을 초과했습니다.
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 카테고리별 예산 목록 */}
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">카테고리별 예산</Typography>
            <Typography variant="caption" color="text.secondary">
              {budgetsWithUsage.length}개
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          {isLoading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={80} />
              ))}
            </Stack>
          ) : budgetsWithUsage.length === 0 ? (
            <EmptyState
              message="등록된 예산이 없습니다."
              actionLabel="첫 예산 추가하기"
              onAction={() => setFormOpen(true)}
            />
          ) : (
            <Stack spacing={2}>
              {/* 초과 항목 먼저, 그 다음 사용률 높은 순 정렬 */}
              {[...budgetsWithUsage]
                .sort((a, b) => b.percentage - a.percentage)
                .map((budget) => (
                  <BudgetProgressBar
                    key={budget.id}
                    budget={budget}
                    onEdit={handleEditClick}
                    onDelete={(id) => setDeleteTarget(id)}
                  />
                ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* 예산 등록/수정 모달 */}
      <BudgetForm
        open={formOpen}
        onClose={handleFormClose}
        year={year}
        month={month}
        editTarget={editTarget}
        existingCategoryIds={existingCategoryIds}
      />

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="예산 삭제"
        description="이 카테고리의 예산 설정을 삭제하시겠습니까?"
        loading={isDeleting}
        onConfirm={() => deleteTarget !== null && deleteBudget(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
