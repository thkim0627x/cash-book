'use client'
import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Fab,
  Divider,
  Alert,
  Paper,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Plus } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import { SummaryCards } from '@/features/dashboard/SummaryCards'
import { BudgetWidget } from '@/features/dashboard/BudgetWidget'
import { TrendMiniWidget } from '@/features/dashboard/TrendMiniWidget'
import { CategoryWidget } from '@/features/dashboard/CategoryWidget'
import { BenefitRecommendBanner } from '@/features/dashboard/BenefitRecommendBanner'
import { TransactionList } from '@/features/transaction/TransactionList'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { MonthPicker } from '@/components/common/MonthPicker'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'

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
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))

  // 거래내역 조회
  const { data: txnRes, isLoading, isError } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })

  const transactions = txnRes?.data?.content ?? []
  const summary = transactionService.getSummary(transactions)
  const recentTransactions = transactions.slice(0, 5)

  // 삭제 mutation
  const { mutate: deleteTxn, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => transactionService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['transactions', year, month] })
      showToast('거래내역이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  return (
    <Box>
      {/* 인사 배너 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'primary.light',
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Typography variant="h6">
          {user?.name ?? '회원'}님, 좋은 하루 보내세요! ☀️
        </Typography>
        <Typography variant="body2" color="text.secondary">
          오늘도 계획적인 소비로 목표에 한 걸음 다가가세요.
        </Typography>
      </Paper>

      {/* 월 선택 + 거래 추가 */}
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
        <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
        {!isXs && (
          <Button variant="contained" startIcon={<Plus weight="bold" />} onClick={() => setFormOpen(true)}>
            거래 추가
          </Button>
        )}
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* 요약 카드 */}
      <Box sx={{ mb: 3 }}>
        {isLoading ? <ListSkeleton rows={1} /> : <SummaryCards summary={summary} />}
      </Box>

      {/* 위젯 그리드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* 예산 현황 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <BudgetWidget year={year} month={month} />
        </Grid>

        {/* 카테고리 분석 도넛 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoryWidget year={year} month={month} />
        </Grid>

        {/* 월별 추이 미니차트 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TrendMiniWidget />
        </Grid>

        {/* 최근 거래내역 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">최근 거래내역</Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => (window.location.href = '/transactions')}
                  sx={{ minWidth: 0 }}
                >
                  모두 보기 →
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {isLoading ? (
                <ListSkeleton rows={5} />
              ) : (
                <TransactionList
                  transactions={recentTransactions}
                  onDelete={(id) => setDeleteTarget(id)}
                  compact={isXs}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 청년 혜택 추천 배너 */}
      <Box sx={{ mb: 3 }}>
        <BenefitRecommendBanner />
      </Box>

      {/* xs: FAB */}
      {isXs && (
        <Fab
          color="primary"
          onClick={() => setFormOpen(true)}
          sx={{ position: 'fixed', bottom: 80, right: 20 }}
        >
          <Plus weight="bold" size={24} />
        </Fab>
      )}

      {/* 거래 등록 모달 — key로 open 시 폼 초기화 */}
      <TransactionForm
        key={`new-${formOpen}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultYear={year}
        defaultMonth={month}
      />

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="거래내역 삭제"
        description="이 거래내역을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        loading={isDeleting}
        onConfirm={() => deleteTarget !== null && deleteTxn(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
