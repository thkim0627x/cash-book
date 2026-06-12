'use client'
import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Fab,
  Alert,
  Card,
  CardContent,
  CardActionArea,
  Chip,
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
  Bank,
  ArrowRight,
  Wallet,
  CreditCard,
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

import { Sparkle } from '@phosphor-icons/react'

// 카드 그림자 (가이드 §4)
const CARD_SHADOW =
  '0 1px 2px rgba(14,36,56,.03), 0 6px 20px rgba(14,36,56,.05)'

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

// ── StatCard ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number
  valueColor: string
  iconBg: string
  icon: React.ReactNode
  chip?: React.ReactNode
  prefix?: string
  loading: boolean
}

function StatCard({
  label,
  value,
  valueColor,
  iconBg,
  icon,
  chip,
  prefix = '',
  loading,
}: StatCardProps) {
  return (
    <Card sx={{ boxShadow: CARD_SHADOW }}>
      <CardContent>
        {/* 아이콘 뱃지 + 칩 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          {chip}
        </Box>
        {/* 라벨 */}
        <Typography
          variant="caption"
          color="text.muted"
          display="block"
          sx={{ mb: 0.5, fontWeight: 500 }}
        >
          {label}
        </Typography>
        {/* 값 */}
        {loading ? (
          <Skeleton height={28} />
        ) : (
          <Typography
            fontWeight={700}
            color={valueColor}
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {prefix}
            {value.toLocaleString('ko-KR')}
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.25 }}
            >
              원
            </Typography>
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

// ── QuickActionCard ────────────────────────────────────────────────────────
interface QuickActionCardProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  onClick: () => void
}

function QuickActionCard({
  icon,
  iconBg,
  label,
  onClick,
}: QuickActionCardProps) {
  return (
    <Card sx={{ boxShadow: CARD_SHADOW }}>
      <CardActionArea
        onClick={onClick}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{ letterSpacing: '-0.01em' }}
        >
          {label}
        </Typography>
      </CardActionArea>
    </Card>
  )
}

// ── DashboardPage ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const now = new Date()
  const [year] = useState(now.getFullYear())
  const [month] = useState(now.getMonth() + 1)
  const [formOpen, setFormOpen] = useState(false)
  const [formDefaultType, setFormDefaultType] =
    useState<TransactionType>('EXPENSE')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const showToast = useToastStore((s) => s.show)
  const user = useAuthStore((s) => s.user)
  const queryClientInstance = useQueryClient()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    data: txnRes,
    isLoading: txnLoading,
    isError,
  } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })

  const { data: assetRes, isLoading: assetLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetService.getAll(),
  })

  const { data: allTimeRes, isLoading: allTimeLoading } = useQuery({
    queryKey: ['transactions-alltime'],
    queryFn: () => transactionService.getAllTimeSummary(),
  })

  const transactions = txnRes?.data?.content ?? []
  const assets = assetRes?.data ?? []

  const assetItems = assets.filter(
    (a) => getAssetClass(a.assetType) === 'ASSET'
  )
  const liabilityItems = assets.filter(
    (a) => getAssetClass(a.assetType) === 'LIABILITY'
  )
  const totalAsset = assetItems.reduce((s, a) => s + a.initialAmount, 0)
  const totalLiability = liabilityItems.reduce((s, a) => s + a.initialAmount, 0)
  const allTimeNet = Number(allTimeRes?.data?.balance ?? 0)
  const netWorth = totalAsset - totalLiability + allTimeNet

  const { mutate: deleteTxn, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => transactionService.remove(id),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({
        queryKey: ['transactions', year, month],
      })
      queryClientInstance.invalidateQueries({ queryKey: ['assets'] })
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      {/* ── 인삿말 + 거래추가 ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.muted"
            sx={{ fontWeight: 500 }}
          >
            {getGreeting()}
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ lineHeight: 1.3, mt: 0.25 }}
          >
            {user?.name ?? '회원'}님, 좋은 하루 보내세요
            <Sparkle size={18} weight="fill" />
          </Typography>
        </Box>
        {/* {!isMobile && (
          <Button
            variant="contained"
            startIcon={<Plus weight="bold" size={15} />}
            onClick={() => openForm('EXPENSE')}
            size="medium"
          >
            거래 추가
          </Button>
        )} */}
      </Box>

      {isError && (
        <Alert severity="error">
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* ── Stats 3열 ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <StatCard
          label="자산"
          value={totalAsset}
          valueColor="primary.main"
          iconBg="primary.light"
          icon={
            <Wallet
              size={18}
              color={theme.palette.primary.main}
              weight="fill"
            />
          }
          chip={
            <Chip
              label="자산"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6875rem',
                fontWeight: 600,
                bgcolor: 'primary.light',
                color: 'primary.main',
              }}
            />
          }
          loading={assetLoading}
        />
        <StatCard
          label="부채"
          value={totalLiability}
          valueColor="error.main"
          iconBg="error.light"
          icon={
            <CreditCard
              size={18}
              color={theme.palette.error.main}
              weight="fill"
            />
          }
          chip={
            <Chip
              label="부채"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6875rem',
                fontWeight: 600,
                bgcolor: 'error.light',
                color: 'error.main',
              }}
            />
          }
          loading={assetLoading}
        />
        <StatCard
          label="자본"
          value={Math.abs(netWorth)}
          valueColor={netWorth >= 0 ? 'success.main' : 'error.main'}
          iconBg={netWorth >= 0 ? 'success.light' : 'error.light'}
          icon={
            <PiggyBank
              size={18}
              color={
                netWorth >= 0
                  ? theme.palette.success.main
                  : theme.palette.error.main
              }
              weight="fill"
            />
          }
          prefix={netWorth < 0 ? '-' : ''}
          chip={
            <Chip
              label={netWorth >= 0 ? '흑자' : '적자'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6875rem',
                fontWeight: 600,
                bgcolor: netWorth >= 0 ? 'success.light' : 'error.light',
                color: netWorth >= 0 ? 'success.main' : 'error.main',
              }}
            />
          }
          loading={assetLoading || allTimeLoading}
        />
      </Box>

      {/* ── 빠른 실행 4열 ──
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        <QuickActionCard
          icon={
            <TrendUp
              size={20}
              color={theme.palette.success.main}
              weight="bold"
            />
          }
          iconBg="success.light"
          label="수입 추가"
          onClick={() => openForm('INCOME')}
        />
        <QuickActionCard
          icon={
            <TrendDown
              size={20}
              color={theme.palette.error.main}
              weight="bold"
            />
          }
          iconBg="error.light"
          label="지출 추가"
          onClick={() => openForm('EXPENSE')}
        />
        <QuickActionCard
          icon={
            <Bank size={20} color={theme.palette.primary.main} weight="bold" />
          }
          iconBg="primary.light"
          label="자산 현황"
          onClick={() => router.push('/assets')}
        />
        <QuickActionCard
          icon={
            <ChartBar
              size={20}
              color={theme.palette.secondary.main}
              weight="bold"
            />
          }
          iconBg="secondary.light"
          label="통계 보기"
          onClick={() => router.push('/statistics')}
        />
      </Box> */}

      {/* ── 메인 2열 그리드 ── */}
      {/* <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <RecentTransactions
          transactions={transactions.slice(0, 6)}
          loading={txnLoading}
          onAdd={() => openForm('EXPENSE')}
          onDelete={(id) => setDeleteTarget(id)}
        />
        <BudgetWidget year={year} month={month} />
        <CategoryWidget year={year} month={month} />
        <TrendMiniWidget />
      </Box> */}

      {/* ── 청년 혜택 배너 ── */}
      <BenefitRecommendBanner />

      {/* ── 더보기 링크 ── */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
        <Button
          variant="text"
          size="small"
          endIcon={<ArrowRight size={14} />}
          onClick={() => router.push('/transactions')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          거래내역 보기
        </Button>
      </Box>

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
