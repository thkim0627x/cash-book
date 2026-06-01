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
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Plus } from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import { SummaryCards } from '@/features/dashboard/SummaryCards'
import { TransactionList } from '@/features/transaction/TransactionList'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { MonthPicker } from '@/components/common/MonthPicker'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { useToastStore } from '@/stores/toastStore'

export default function DashboardPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const showToast = useToastStore((s) => s.show)
  const queryClientInstance = useQueryClient()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))

  // 거래내역 조회
  const {
    data: txnRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 100 }),
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
    onError: () => {
      showToast('삭제에 실패했습니다.', 'error')
    },
  })

  return (
    <Box>
      {/* 월 선택 + 거래 추가 버튼 */}
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
          <Button
            variant="contained"
            startIcon={<Plus weight="bold" />}
            onClick={() => setFormOpen(true)}
          >
            거래 추가
          </Button>
        )}
      </Box>

      {/* 에러 */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* 요약 카드 */}
      <Box sx={{ mb: 3 }}>
        {isLoading ? (
          <ListSkeleton rows={1} />
        ) : (
          <SummaryCards summary={summary} />
        )}
      </Box>

      {/* 최근 거래내역 */}
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Typography variant="h6">최근 거래내역</Typography>
            <Typography variant="body2" color="text.secondary">
              {transactions.length}건
            </Typography>
          </Box>
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

          {!isLoading && transactions.length > 5 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="text"
                size="small"
                color="primary"
                component="a"
                href="/transactions"
              >
                전체 보기 ({transactions.length}건) →
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* xs: FAB */}
      {isXs && (
        <Fab
          color="primary"
          onClick={() => setFormOpen(true)}
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
        >
          <Plus weight="bold" size={24} />
        </Fab>
      )}

      {/* 거래 등록 모달 */}
      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultYear={year}
        defaultMonth={month}
      />

      {/* 삭제 확인 다이얼로그 */}
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
