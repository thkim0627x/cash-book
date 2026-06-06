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
  Card,
  CardContent,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Plus,
  TrendUp,
  TrendDown,
  PiggyBank,
  ChartBar,
} from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { transactionService } from '@/services/transaction.service'
import { assetService } from '@/services/asset.service'
import { BudgetWidget } from '@/features/dashboard/BudgetWidget'
import { TrendMiniWidget } from '@/features/dashboard/TrendMiniWidget'
import { CategoryWidget } from '@/features/dashboard/CategoryWidget'
import { BenefitRecommendBanner } from '@/features/dashboard/BenefitRecommendBanner'
import { RecentTransactions } from '@/features/dashboard/RecentTransactions'
import { TransactionForm } from '@/features/transaction/TransactionForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'
import type { TransactionType } from '@/types/category'
import type { AssetType } from '@/types/asset'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '새벽에도 열심히시네요'
  if (h < 12) return '좋은 아침이에요'
  if (h < 18) return '좋은 오후예요'
  return '좋은 저녁이에요'
}

function getAssetClass(type: AssetType): 'ASSET' | 'LIABILITY' {
  return type === 'CREDIT_CARD' ? 'LIABILITY' : 'ASSET'
}

interface SummaryCardProps {
  label: string
  value: number
  color: string
  prefix?: string
  loading: boolean
}

function SummaryCard({ label, value, color, prefix = '', loading }: SummaryCardProps) {
  return (
    <Card sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton height={28} />
        ) : (
          <Typography
            fontWeight={800}
            color={color}
            sx={{ fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' }, lineHeight: 1.2 }}
          >
            {prefix}{value.toLocaleString('ko-KR')}
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.25, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
            >
              원
            </Typography>
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

interface QuickActionProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function QuickActionButton({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        flex: 1,
        flexDirection: 'column',
        gap: 0.5,
        py: 1.5,
        height: 'auto',
        borderRadius: 1,
        borderColor: 'divider',
        color: 'text.primary',
        fontSize: { xs: '0.7rem', sm: '0.8rem' },
        fontWeight: 600,
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      {icon}
      {label}
    </Button>
  )
}

export default function DashboardPage() {
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)
  const [formOpen, setFormOpen] = useState(false)
  const [formDefaultType, setFormDefaultType] = useState<TransactionType>('EXPENSE')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const showToast = useToastStore((s) => s.show)
  const user = useAuthStore((s) => s.user)
  const queryClientInstance = useQueryClient()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { data: txnRes, isLoading: txnLoading, isError } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })

  const { data: assetRes, isLoading: assetLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetService.getAll(),
  })

  const transactions = txnRes?.data?.content ?? []
  const assets = assetRes?.data ?? []

  const assetItems = assets.filter((a) => getAssetClass(a.assetType) === 'ASSET')
  const liabilityItems = assets.filter((a) => getAssetClass(a.assetType) === 'LIABILITY')
  const totalAsset = assetItems.reduce((s, a) => s + a.initialAmount, 0)
  const totalLiability = liabilityItems.reduce((s, a) => s + a.initialAmount, 0)
  const netWorth = totalAsset - totalLiability

  const { mutate: deleteTxn, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => transactionService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ['transactions', year, month] })
      showToast('거래내역이 삭제되었습니다.', 'success')
      setDeleteTarget(null)
    },
    onError: () => showToast('삭제에 실패했습니다.', 'error'),
  })

  const openForm = (type: TransactionType) => {
    setFormDefaultType(type)
    setFormOpen(true)
  }

  return (
    <Box sx={{ pb: isMobile ? 10 : 4 }}>

      {/* ── 인삿말 + 거래 추가 버튼 ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {getGreeting()}, <strong>{user?.name ?? '회원'}님</strong>
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<Plus weight="bold" size={16} />}
            onClick={() => openForm('EXPENSE')}
            size="medium"
          >
            거래 추가
          </Button>
        )}
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>데이터를 불러오는 중 오류가 발생했습니다.</Alert>
      )}

      {/* ── 3-카드 요약 (자산/부채/자본) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: { xs: 1, sm: 1.5 },
          mb: 2,
        }}
      >
        <SummaryCard label="자산" value={totalAsset} color="info.main" loading={assetLoading} />
        <SummaryCard label="부채" value={totalLiability} color="error.main" loading={assetLoading} />
        <SummaryCard
          label="자본"
          value={Math.abs(netWorth)}
          color={netWorth >= 0 ? 'success.main' : 'error.main'}
          prefix={netWorth < 0 ? '-' : ''}
          loading={assetLoading}
        />
      </Box>

      {/* ── 빠른 실행 ── */}
      <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
        <QuickActionButton
          icon={<TrendUp size={20} weight="bold" color={theme.palette.info.main} />}
          label="수입 추가"
          onClick={() => openForm('INCOME')}
        />
        <QuickActionButton
          icon={<TrendDown size={20} weight="bold" color={theme.palette.error.main} />}
          label="지출 추가"
          onClick={() => openForm('EXPENSE')}
        />
        <QuickActionButton
          icon={<PiggyBank size={20} weight="bold" color={theme.palette.primary.main} />}
          label="자산 현황"
          onClick={() => router.push('/assets')}
        />
        <QuickActionButton
          icon={<ChartBar size={20} weight="bold" color={theme.palette.primary.main} />}
          label="통계"
          onClick={() => router.push('/statistics')}
        />
      </Stack>

      {/* ── 메인 그리드 ── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>

        {/* 최근 거래내역 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentTransactions
            transactions={transactions.slice(0, 6)}
            loading={txnLoading}
            onAdd={() => openForm('EXPENSE')}
            onDelete={(id) => setDeleteTarget(id)}
          />
        </Grid>

        {/* 예산 현황 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <BudgetWidget year={year} month={month} />
        </Grid>

        {/* 카테고리별 지출 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoryWidget year={year} month={month} />
        </Grid>

        {/* 월별 추이 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TrendMiniWidget />
        </Grid>
      </Grid>

      {/* ── 청년 혜택 ── */}
      <BenefitRecommendBanner />

      {/* 모바일 FAB */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => openForm('EXPENSE')}
          sx={{ position: 'fixed', bottom: 76, right: 20, zIndex: 10 }}
        >
          <Plus weight="bold" size={24} />
        </Fab>
      )}

      <TransactionForm
        key={`new-${formOpen}-${formDefaultType}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultYear={year}
        defaultMonth={month}
        defaultType={formDefaultType}
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
