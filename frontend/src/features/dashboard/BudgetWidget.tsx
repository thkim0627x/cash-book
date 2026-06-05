'use client'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Box,
  Button,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { budgetService } from '@/services/budget.service'
import { transactionService } from '@/services/transaction.service'
import { EmptyState } from '@/components/common/EmptyState'

interface BudgetWidgetProps {
  year: number
  month: number
}

export function BudgetWidget({ year, month }: BudgetWidgetProps) {
  const router = useRouter()

  const { data: budgetRes, isLoading: budgetLoading } = useQuery({
    queryKey: ['budgets', year, month],
    queryFn: () => budgetService.getList(year, month),
  })
  const { data: txnRes, isLoading: txnLoading } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })

  const isLoading = budgetLoading || txnLoading
  const budgets = budgetRes?.data ?? []
  const transactions = txnRes?.data?.content ?? []

  // 카테고리별 지출 합산
  const expenseMap: Record<number, number> = {}
  for (const t of transactions) {
    if (t.type === 'EXPENSE') {
      expenseMap[t.categoryId] = (expenseMap[t.categoryId] ?? 0) + t.amount
    }
  }

  const totalLimit = budgets.reduce((s, b) => s + b.amount, 0)
  const totalUsed = budgets.reduce((s, b) => s + (expenseMap[b.categoryId] ?? 0), 0)
  const totalPct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0
  const overCount = budgets.filter(
    (b) => b.amount > 0 && (expenseMap[b.categoryId] ?? 0) >= b.amount
  ).length

  const barColor = totalPct >= 100 ? 'error' : totalPct >= 80 ? 'warning' : 'primary'

  return (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">예산 현황</Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => router.push('/budget')}
            sx={{ minWidth: 0 }}
          >
            관리 →
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        {isLoading ? (
          <>
            <Skeleton height={28} sx={{ mb: 1 }} />
            <Skeleton height={12} sx={{ borderRadius: 2 }} />
          </>
        ) : budgets.length === 0 ? (
          <EmptyState
            message="설정된 예산이 없습니다."
            actionLabel="예산 설정하기"
            onAction={() => router.push('/budget')}
          />
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {totalUsed.toLocaleString('ko-KR')}원
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / {totalLimit.toLocaleString('ko-KR')}원
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(totalPct, 100)}
                color={barColor}
                sx={{ flex: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" fontWeight={700} color={`${barColor}.main`} sx={{ minWidth: 44 }}>
                {Math.round(totalPct)}%
              </Typography>
            </Stack>

            <Box sx={{ minHeight: 24 }}>
              {overCount > 0 ? (
                <Alert severity="error" variant="outlined" sx={{ mt: 1.5, py: 0 }}>
                  <strong>{overCount}개</strong> 카테고리가 예산을 초과했어요.
                </Alert>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  남은 예산 {(totalLimit - totalUsed).toLocaleString('ko-KR')}원
                </Typography>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}
