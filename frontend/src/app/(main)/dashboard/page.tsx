'use client'
import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Fab,
  Alert,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material'
import { Plus, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import { SummaryHeroCard } from '@/features/dashboard/SummaryHeroCard'
import { BudgetWidget } from '@/features/dashboard/BudgetWidget'
import { TrendMiniWidget } from '@/features/dashboard/TrendMiniWidget'
import { CategoryWidget } from '@/features/dashboard/CategoryWidget'
import { BenefitRecommendBanner } from '@/features/dashboard/BenefitRecommendBanner'
import { RecentTransactions } from '@/features/dashboard/RecentTransactions'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '새벽에도 열심히시네요'
  if (h < 12) return '좋은 아침이에요'
  if (h < 18) return '좋은 오후예요'
  return '좋은 저녁이에요'
}

export default function DashboardPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const showToast = useToastStore((s) => s.show)
  const user = useAuthStore((s) => s.user)
  const queryClientInstance = useQueryClient()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { data: txnRes, isLoading, isError } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })

  const transactions = txnRes?.data?.content ?? []
  const summary = transactionService.getSummary(transactions)

  const { mutate: deleteTxn, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => transactionService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['transactions', year, month] })
      showToast('거래내역이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <Box sx={{ pb: isMobile ? 10 : 4 }}>

      {/* ── 상단 헤더 ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {getGreeting()}, <strong>{user?.name ?? '회원'}님</strong>
          </Typography>
          {/* 월 네비게이터 */}
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
            <IconButton size="small" onClick={prevMonth} sx={{ p: 0.5 }}>
              <CaretLeft size={16} />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ minWidth: 72, textAlign: 'center' }}>
              {year}년 {month}월
            </Typography>
            <IconButton size="small" onClick={nextMonth} disabled={isCurrentMonth} sx={{ p: 0.5 }}>
              <CaretRight size={16} color={isCurrentMonth ? theme.palette.action.disabled : undefined} />
            </IconButton>
          </Stack>
        </Box>

        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<Plus weight="bold" size={16} />}
            onClick={() => setFormOpen(true)}
            size="medium"
          >
            거래 추가
          </Button>
        )}
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>데이터를 불러오는 중 오류가 발생했습니다.</Alert>
      )}

      {/* ── 잔액 히어로 카드 ── */}
      <Box sx={{ mb: 2.5 }}>
        <SummaryHeroCard summary={summary} loading={isLoading} month={month} />
      </Box>

      {/* ── 메인 그리드 ── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>

        {/* 최근 거래내역 — 모바일에서 먼저 */}
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 1, md: 2 }}>
          <RecentTransactions
            transactions={transactions.slice(0, 6)}
            loading={isLoading}
            onAdd={() => setFormOpen(true)}
            onDelete={(id) => setDeleteTarget(id)}
          />
        </Grid>

        {/* 예산 현황 */}
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 2, md: 1 }}>
          <BudgetWidget year={year} month={month} />
        </Grid>

        {/* 카테고리별 지출 */}
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 3, md: 3 }}>
          <CategoryWidget year={year} month={month} />
        </Grid>

        {/* 월별 추이 */}
        <Grid size={{ xs: 12, md: 6 }} order={{ xs: 4, md: 4 }}>
          <TrendMiniWidget />
        </Grid>
      </Grid>

      {/* ── 청년 혜택 ── */}
      <BenefitRecommendBanner />

      {/* 모바일 FAB */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setFormOpen(true)}
          sx={{ position: 'fixed', bottom: 76, right: 20, zIndex: 10 }}
        >
          <Plus weight="bold" size={24} />
        </Fab>
      )}

      <TransactionForm
        key={`new-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultYear={year}
        defaultMonth={month}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="거래내역 삭제"
        description="이 거래내역을 삭제하시겠습니까?"
        loading={isDeleting}
        onConfirm={() => deleteTarget !== null && deleteTxn(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
