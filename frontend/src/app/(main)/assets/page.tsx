'use client'
import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, Typography, Stack, Chip, Divider,
  IconButton, Fab, Button, Skeleton, Alert, Collapse,
  useTheme, useMediaQuery, Drawer, Avatar,
} from '@mui/material'
import {
  Bank, CreditCard, Money, Bag, Gear, CaretDown, CaretUp,
  Scales, X, ArrowRight, Repeat, Plus,
} from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { assetService } from '@/services/asset.service'
import { subscriptionService } from '@/services/subscription.service'
import type { Asset, AssetType } from '@/types/asset'
import { BILLING_CYCLE_LABELS } from '@/types/subscription'

// ── 카테고리 설정 ────────────────────────────────────────────────────────────
type AssetClass = 'ASSET' | 'LIABILITY'

interface CategoryConfig {
  label: string
  icon: React.ElementType
  bg: string
  fg: string
  cls: AssetClass
}

const CATEGORY_CONFIG: Record<AssetType, CategoryConfig> = {
  SAVINGS:     { label: '예금/적금',    icon: Bank,       bg: '#e3f2fd', fg: '#1565c0', cls: 'ASSET' },
  CASH:        { label: '현금',         icon: Money,      bg: '#e8f5e9', fg: '#2e7d32', cls: 'ASSET' },
  ETC:         { label: '기타 자산',    icon: Bag,        bg: '#f3e5f5', fg: '#6a1b9a', cls: 'ASSET' },
  CREDIT_CARD: { label: '신용카드/부채', icon: CreditCard, bg: '#ffebee', fg: '#c62828', cls: 'LIABILITY' },
}

const ASSET_ORDER: AssetType[] = ['SAVINGS', 'CASH', 'ETC', 'CREDIT_CARD']

// ── 자산 분류 헬퍼 ───────────────────────────────────────────────────────────
function useAssetStats(assets: Asset[]) {
  return useMemo(() => {
    const assetItems   = assets.filter(a => CATEGORY_CONFIG[a.assetType].cls === 'ASSET')
    const liabItems    = assets.filter(a => CATEGORY_CONFIG[a.assetType].cls === 'LIABILITY')
    const totalAssets  = assetItems.reduce((s, a) => s + a.initialAmount, 0)
    const totalLiab    = liabItems.reduce((s, a) => s + a.initialAmount, 0)
    const netWorth     = totalAssets - totalLiab

    // 자산 구성 비율
    const byType = assets.reduce<Record<AssetType, number>>((acc, a) => {
      acc[a.assetType] = (acc[a.assetType] ?? 0) + a.initialAmount
      return acc
    }, {} as Record<AssetType, number>)

    // 자산 유형별 그룹
    const grouped = assets.reduce<Record<AssetType, Asset[]>>((acc, a) => {
      if (!acc[a.assetType]) acc[a.assetType] = []
      acc[a.assetType].push(a)
      return acc
    }, {} as Record<AssetType, Asset[]>)

    return { assetItems, liabItems, totalAssets, totalLiab, netWorth, byType, grouped }
  }, [assets])
}

// ── 요약 바 (자산/부채/자본) ──────────────────────────────────────────────────
function SummaryBar({ totalAssets, totalLiab, netWorth, loading }: {
  totalAssets: number; totalLiab: number; netWorth: number; loading: boolean
}) {
  const items = [
    { label: '자산',   value: totalAssets, color: 'info.main' as const },
    { label: '부채',   value: totalLiab,   color: 'error.main' as const },
    { label: '자본',   value: netWorth,    color: (netWorth >= 0 ? 'success.main' : 'error.main') as string },
  ]

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: { xs: 1, sm: 1.5 }, mb: 2 }}>
      {items.map((item) => (
        <Card key={item.label} sx={{ borderRadius: 1 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              {item.label}
            </Typography>
            {loading ? (
              <Skeleton height={28} />
            ) : (
              <Typography
                fontWeight={800} color={item.color}
                sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' }, lineHeight: 1.2 }}
              >
                {item.label === '부채' && item.value > 0 && '-'}
                {Math.abs(item.value).toLocaleString('ko-KR')}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.25, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>원</Typography>
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

// ── 자산 구성 바 ──────────────────────────────────────────────────────────────
function CompositionBar({ byType, totalAssets, loading }: {
  byType: Record<AssetType, number>; totalAssets: number; loading: boolean
}) {
  const segments = useMemo(() => {
    if (totalAssets === 0) return []
    return ASSET_ORDER
      .filter(t => CATEGORY_CONFIG[t].cls === 'ASSET' && (byType[t] ?? 0) > 0)
      .map(t => ({
        type: t,
        pct: Math.round(((byType[t] ?? 0) / totalAssets) * 100),
        ...CATEGORY_CONFIG[t],
      }))
  }, [byType, totalAssets])

  if (loading) return <Skeleton height={52} sx={{ mb: 2, borderRadius: 1 }} />
  if (segments.length === 0) return null

  return (
    <Card sx={{ borderRadius: 1, mb: 2 }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
          자산 구성
        </Typography>
        <Box sx={{ display: 'flex', height: 6, borderRadius: 1, overflow: 'hidden', mb: 1.5, gap: '2px' }}>
          {segments.map((s) => (
            <Box key={s.type} sx={{ width: `${s.pct}%`, bgcolor: s.fg, borderRadius: 0.5, opacity: 0.85, transition: 'width 0.4s' }} />
          ))}
        </Box>
        <Stack direction="row" flexWrap="wrap" sx={{ gap: '4px 14px' }}>
          {segments.map((s) => (
            <Stack key={s.type} direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.fg, flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', lineHeight: 1 }}>
                {s.label} {s.pct}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

// ── 개별 자산 행 ──────────────────────────────────────────────────────────────
function AssetRow({ asset, isSelected, onClick }: {
  asset: Asset; isSelected: boolean; onClick: () => void
}) {
  const cfg = CATEGORY_CONFIG[asset.assetType]
  const Icon = cfg.icon

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: { xs: 2, sm: 2.5 }, py: 1.25,
        cursor: 'pointer',
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        transition: 'background-color 0.12s',
        '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' },
      }}
    >
      <Avatar sx={{ width: 34, height: 34, bgcolor: cfg.bg, flexShrink: 0 }}>
        <Icon size={17} color={cfg.fg} />
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{asset.name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>{cfg.label}</Typography>
      </Box>
      <Typography
        variant="body2" fontWeight={700} flexShrink={0}
        color={cfg.cls === 'LIABILITY' ? 'error.main' : 'text.primary'}
      >
        {asset.initialAmount.toLocaleString('ko-KR')}
        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.25 }}>원</Typography>
      </Typography>
    </Box>
  )
}

// ── 분류 섹션 (자산 / 부채) ────────────────────────────────────────────────────
function AssetSection({
  title, items, total, cls, loading, selectedId, onSelect,
}: {
  title: string; items: Asset[]; total: number; cls: AssetClass
  loading: boolean; selectedId: number | null; onSelect: (a: Asset) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const titleColor = cls === 'ASSET' ? 'info.main' : 'error.main'

  return (
    <Box sx={{ mb: 1.5, borderRadius: 1, overflow: 'hidden', border: '2px solid', borderColor: 'divider' }}>
      <Box
        onClick={() => setExpanded(e => !e)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: { xs: 2, sm: 2.5 }, py: 1,
          bgcolor: 'grey.50', cursor: 'pointer',
          borderBottom: expanded ? '1px solid' : 'none', borderColor: 'divider',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography variant="subtitle2" fontWeight={700} color={titleColor}>{title}</Typography>
          <Chip label={`${items.length}개`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {loading ? <Skeleton width={80} height={20} /> : (
            <Typography variant="body2" fontWeight={700} color={titleColor}>
              {total.toLocaleString('ko-KR')}원
            </Typography>
          )}
          {expanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
        </Stack>
      </Box>

      <Collapse in={expanded}>
        {loading ? (
          <Stack>
            {[1, 2].map(i => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.25 }}>
                <Skeleton variant="circular" width={34} height={34} />
                <Box sx={{ flex: 1 }}><Skeleton width="50%" /><Skeleton width="30%" /></Box>
                <Skeleton width={80} />
              </Box>
            ))}
          </Stack>
        ) : items.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>
              등록된 {title}이 없어요
            </Typography>
          </Box>
        ) : (
          <Stack>
            {items.map((asset, idx) => (
              <Box key={asset.id}>
                {idx > 0 && <Divider />}
                <AssetRow
                  asset={asset}
                  isSelected={selectedId === asset.id}
                  onClick={() => onSelect(asset)}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Collapse>
    </Box>
  )
}

// ── 구독 섹션 ─────────────────────────────────────────────────────────────────
function SubscriptionSection({ subscriptions, loading, router }: {
  subscriptions: ReturnType<typeof Array.prototype.map>; loading: boolean; router: ReturnType<typeof useRouter>
}) {
  const [expanded, setExpanded] = useState(false)

  const monthly = (subscriptions as any[]).filter((s: any) => s.billingCycle === 'MONTHLY').reduce((sum: number, s: any) => sum + s.amount, 0)
  const weekly  = (subscriptions as any[]).filter((s: any) => s.billingCycle === 'WEEKLY').reduce((sum: number, s: any) => sum + s.amount * 4, 0)
  const total   = monthly + weekly

  return (
    <Box sx={{ mb: 1.5, borderRadius: 1, overflow: 'hidden', border: '2px solid', borderColor: 'divider' }}>
      <Box
        onClick={() => setExpanded(e => !e)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: { xs: 2, sm: 2.5 }, py: 1,
          bgcolor: 'grey.50', cursor: 'pointer',
          borderBottom: expanded && !loading ? '1px solid' : 'none', borderColor: 'divider',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Repeat size={15} />
          <Typography variant="subtitle2" fontWeight={700}>구독/정기결제</Typography>
          <Chip label={`${(subscriptions as any[]).length}개`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {total > 0 && (
            <Typography variant="body2" fontWeight={700} color="error.main">월 {total.toLocaleString('ko-KR')}원</Typography>
          )}
          {expanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
        </Stack>
      </Box>

      <Collapse in={expanded}>
        {loading ? (
          <Box sx={{ px: 2.5, py: 2 }}><Skeleton /><Skeleton width="70%" /></Box>
        ) : (subscriptions as any[]).length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>등록된 구독 서비스가 없어요</Typography>
          </Box>
        ) : (
          <Stack>
            {(subscriptions as any[]).map((sub: any, idx: number) => (
              <Box key={sub.id}>
                {idx > 0 && <Divider />}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: { xs: 2, sm: 2.5 }, py: 1.25 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{sub.name}</Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                      <Chip label={BILLING_CYCLE_LABELS[sub.billingCycle as keyof typeof BILLING_CYCLE_LABELS]} size="small" sx={{ height: 16, fontSize: '0.65rem' }} />
                      {sub.nextBillingDayOfMonth && (
                        <Typography variant="caption" color="text.secondary">매월 {sub.nextBillingDayOfMonth}일</Typography>
                      )}
                    </Stack>
                  </Box>
                  <Typography variant="body2" fontWeight={700} color="error.main">
                    {sub.amount.toLocaleString('ko-KR')}원
                  </Typography>
                </Stack>
              </Box>
            ))}
            {total > 0 && (
              <>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: { xs: 2, sm: 2.5 }, py: 1.25, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">월 고정 지출 합계</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">{total.toLocaleString('ko-KR')}원</Typography>
                </Stack>
              </>
            )}
          </Stack>
        )}
      </Collapse>
    </Box>
  )
}

// ── 상세 패널 ─────────────────────────────────────────────────────────────────
function DetailPanel({ asset, onClose, isDrawer = false }: {
  asset: Asset | null; onClose?: () => void; isDrawer?: boolean
}) {
  if (!asset) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 2, p: 4, color: 'text.disabled',
      }}>
        <Scales size={48} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          자산을 선택하면<br />상세 정보를 확인할 수 있어요
        </Typography>
      </Box>
    )
  }

  const cfg = CATEGORY_CONFIG[asset.assetType]
  const Icon = cfg.icon
  const isLiability = cfg.cls === 'LIABILITY'
  const d = new Date(asset.createdAt)

  return (
    <Box sx={{ p: { xs: 3, sm: 3 }, overflowY: 'auto', height: '100%' }}>
      {isDrawer && onClose && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
          <IconButton size="small" onClick={onClose}><X size={18} /></IconButton>
        </Stack>
      )}

      <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={32} color={cfg.fg} />
        </Box>
        <Box textAlign="center">
          <Typography variant="h5" fontWeight={800} color={isLiability ? 'error.main' : 'text.primary'}>
            {isLiability && asset.initialAmount > 0 && '-'}
            {asset.initialAmount.toLocaleString('ko-KR')}
            <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>원</Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{asset.name}</Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56 }}>구분</Typography>
          <Chip
            label={isLiability ? '부채' : '자산'}
            size="small"
            sx={{ bgcolor: cfg.bg, color: cfg.fg, fontWeight: 700 }}
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56 }}>유형</Typography>
          <Typography variant="body2" fontWeight={500}>{cfg.label}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 56 }}>등록일</Typography>
          <Typography variant="body2" fontWeight={500}>
            {d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile   = useMediaQuery(theme.breakpoints.down('md'))   // < 900px
  const isTabletUp = useMediaQuery(theme.breakpoints.up('md'))     // ≥ 900px

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: assetRes, isLoading: assetLoading, isError } = useQuery({
    queryKey: ['assets'],
    queryFn: assetService.getAll,
  })
  const { data: subRes, isLoading: subLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionService.getAll,
  })

  const assets       = assetRes?.data ?? []
  const subscriptions = subRes?.data ?? []

  const { assetItems, liabItems, totalAssets, totalLiab, netWorth, byType } = useAssetStats(assets)

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset)
    if (isMobile) setDrawerOpen(true)
  }

  // ── 리스트 콘텐츠 ─────────────────────────────────────────────────────────
  const listContent = (
    <Box>
      <SummaryBar totalAssets={totalAssets} totalLiab={totalLiab} netWorth={netWorth} loading={assetLoading} />
      <CompositionBar byType={byType} totalAssets={totalAssets} loading={assetLoading} />

      {isError && <Alert severity="error" sx={{ mb: 2 }}>데이터를 불러오는 중 오류가 발생했습니다.</Alert>}

      {assets.length === 0 && !assetLoading ? (
        <Box sx={{ mb: 1.5, borderRadius: 1, overflow: 'hidden', border: '2px solid', borderColor: 'divider' }}>
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Scales size={40} style={{ opacity: 0.25, display: 'block', margin: '0 auto 12px' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              등록된 자산이 없어요.<br />설정에서 자산을 추가해보세요.
            </Typography>
            <Button variant="contained" startIcon={<Plus size={14} />} onClick={() => router.push('/settings')}>
              자산 추가하기
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          <AssetSection
            title="자산"
            items={assetItems}
            total={totalAssets}
            cls="ASSET"
            loading={assetLoading}
            selectedId={selectedAsset?.id ?? null}
            onSelect={handleSelectAsset}
          />
          {(liabItems.length > 0 || assetLoading) && (
            <AssetSection
              title="부채"
              items={liabItems}
              total={totalLiab}
              cls="LIABILITY"
              loading={assetLoading}
              selectedId={selectedAsset?.id ?? null}
              onSelect={handleSelectAsset}
            />
          )}
        </>
      )}

      <SubscriptionSection
        subscriptions={subscriptions}
        loading={subLoading}
        router={router}
      />
    </Box>
  )

  return (
    <Box sx={{ pb: isMobile ? 10 : 4 }}>
      {/* 페이지 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>자산 현황</Typography>
        <Button
          size="small" variant="outlined"
          startIcon={<Gear size={14} />}
          onClick={() => router.push('/settings')}
          sx={{ fontSize: '0.75rem', height: 30 }}
        >
          자산 관리
        </Button>
      </Stack>

      {/* ── 레이아웃 ── */}
      {isTabletUp ? (
        /* 태블릿/PC: 좌 목록 + 우 상세 */
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ flex: '0 0 auto', width: { md: '55%', lg: '520px' }, minWidth: 0 }}>
            {listContent}
          </Box>
          <Box
            sx={{
              flex: 1, minWidth: 0,
              position: 'sticky', top: 80,
              maxHeight: 'calc(100dvh - 100px)', overflowY: 'auto',
              borderRadius: 1, border: '1px solid', borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <DetailPanel asset={selectedAsset} />
          </Box>
        </Box>
      ) : (
        /* 모바일: 단일 컬럼 */
        listContent
      )}

      {/* 모바일 상세 Drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen && isMobile}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px 16px 0 0', maxHeight: '60dvh', overflow: 'hidden' } }}
      >
        <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2, mx: 'auto', mt: 1.5, mb: 0.5 }} />
        <DetailPanel asset={selectedAsset} onClose={() => setDrawerOpen(false)} isDrawer />
      </Drawer>

      {/* 모바일 FAB */}
      {isMobile && (
        <Fab color="primary" onClick={() => router.push('/settings')} sx={{ position: 'fixed', bottom: 80, right: 20, zIndex: 10 }}>
          <Gear weight="bold" size={24} />
        </Fab>
      )}
    </Box>
  )
}
