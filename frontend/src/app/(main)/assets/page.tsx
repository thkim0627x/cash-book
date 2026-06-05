'use client'
import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Fab,
  Alert,
  Skeleton,
  Grid,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material'
import {
  Bank,
  CreditCard,
  Money,
  Bag,
  Plus,
  Gear,
  ArrowRight,
  Repeat,
} from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { assetService } from '@/services/asset.service'
import { subscriptionService } from '@/services/subscription.service'
import type { AssetType } from '@/types/asset'
import { ASSET_TYPE_LABELS } from '@/types/asset'
import { BILLING_CYCLE_LABELS } from '@/types/subscription'
import { PageHeader } from '@/components/common/PageHeader'

const ASSET_ICONS: Record<AssetType, React.ElementType> = {
  SAVINGS: Bank,
  CREDIT_CARD: CreditCard,
  CASH: Money,
  ETC: Bag,
}

const ASSET_COLORS: Record<AssetType, { bg: string; fg: string }> = {
  SAVINGS: { bg: '#e3f2fd', fg: '#1565c0' },
  CREDIT_CARD: { bg: '#fce4ec', fg: '#c62828' },
  CASH: { bg: '#e8f5e9', fg: '#2e7d32' },
  ETC: { bg: '#f3e5f5', fg: '#6a1b9a' },
}

export default function AssetsPage() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { data: assetRes, isLoading: assetLoading, isError: assetError } = useQuery({
    queryKey: ['assets'],
    queryFn: assetService.getAll,
  })

  const { data: subRes, isLoading: subLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionService.getAll,
  })

  const assets = assetRes?.data ?? []
  const subscriptions = subRes?.data ?? []

  const totalAssets = assets.reduce((sum, a) => sum + a.initialAmount, 0)
  const monthlySubscriptions = subscriptions
    .filter((s) => s.billingCycle === 'MONTHLY')
    .reduce((sum, s) => sum + s.amount, 0)
  const weeklyToMonthly = subscriptions
    .filter((s) => s.billingCycle === 'WEEKLY')
    .reduce((sum, s) => sum + s.amount * 4, 0)

  const totalMonthlyFixed = monthlySubscriptions + weeklyToMonthly

  // 자산 유형별 그룹화
  const grouped = assets.reduce<Record<AssetType, typeof assets>>((acc, a) => {
    if (!acc[a.assetType]) acc[a.assetType] = []
    acc[a.assetType].push(a)
    return acc
  }, {} as Record<AssetType, typeof assets>)

  return (
    <Box sx={{ pb: isMobile ? 10 : 4 }}>
      <PageHeader title="자산 현황" />

      {assetError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* ── 총 자산 히어로 카드 ── */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          boxShadow: `0 8px 24px ${theme.palette.primary.main}44`,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
          <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
            총 자산
          </Typography>

          {assetLoading ? (
            <Skeleton width={200} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mt: 0.5 }} />
          ) : (
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ mt: 0.5, mb: 2.5, letterSpacing: -1, lineHeight: 1.1 }}
            >
              {totalAssets.toLocaleString('ko-KR')}
              <Typography component="span" variant="h5" sx={{ ml: 0.5, opacity: 0.85 }}>원</Typography>
            </Typography>
          )}

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              등록된 자산{' '}
              <Typography component="span" variant="caption" fontWeight={700} sx={{ opacity: 1 }}>
                {assets.length}개
              </Typography>
            </Typography>
            <Button
              size="small"
              variant="text"
              endIcon={<ArrowRight size={14} />}
              onClick={() => router.push('/settings')}
              sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', minWidth: 0 }}
            >
              자산 관리
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ── 자산 목록 ── */}
      {assetLoading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton width="40%" height={32} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : assets.length === 0 ? (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
              <Bank size={48} color={theme.palette.text.disabled} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                등록된 자산이 없어요.<br />
                설정에서 자산을 추가해보세요.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Gear size={16} />}
                onClick={() => router.push('/settings')}
              >
                자산 추가하기
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ mb: 3 }}>
          {(Object.keys(grouped) as AssetType[]).map((type) => (
            <Box key={type} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                {ASSET_TYPE_LABELS[type]}
              </Typography>
              <Grid container spacing={2}>
                {grouped[type].map((asset) => {
                  const IconComp = ASSET_ICONS[asset.assetType]
                  const colors = ASSET_COLORS[asset.assetType]
                  return (
                    <Grid key={asset.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'box-shadow 0.2s',
                          '&:hover': { boxShadow: 3 },
                        }}
                      >
                        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  bgcolor: colors.bg,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <IconComp size={22} color={colors.fg} />
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {asset.name}
                                </Typography>
                                <Chip
                                  label={ASSET_TYPE_LABELS[asset.assetType]}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: colors.bg,
                                    color: colors.fg,
                                    mt: 0.25,
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Stack>

                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ mt: 2, color: 'text.primary' }}
                          >
                            {asset.initialAmount.toLocaleString('ko-KR')}
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              원
                            </Typography>
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* ── 구독/정기결제 ── */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Repeat size={20} color={theme.palette.primary.main} />
              <Typography variant="h6" fontWeight={700}>구독 서비스</Typography>
            </Stack>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowRight size={14} />}
              onClick={() => router.push('/settings')}
              sx={{ minWidth: 0, color: 'text.secondary', fontSize: '0.75rem' }}
            >
              관리
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {subLoading ? (
            <Stack spacing={1.5}>
              {[1, 2].map((i) => (
                <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                  <Skeleton width="40%" height={20} />
                  <Skeleton width={80} height={20} />
                </Stack>
              ))}
            </Stack>
          ) : subscriptions.length === 0 ? (
            <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                등록된 구독 서비스가 없어요.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Plus size={14} />}
                onClick={() => router.push('/settings')}
              >
                구독 추가
              </Button>
            </Stack>
          ) : (
            <>
              <Stack spacing={0}>
                {subscriptions.map((sub, idx) => (
                  <Box key={sub.id}>
                    {idx > 0 && <Divider sx={{ my: 1 }} />}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {sub.name}
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                          <Chip
                            label={BILLING_CYCLE_LABELS[sub.billingCycle]}
                            size="small"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                          {sub.nextBillingDayOfMonth && (
                            <Typography variant="caption" color="text.secondary">
                              매월 {sub.nextBillingDayOfMonth}일
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="error.main">
                        -{sub.amount.toLocaleString('ko-KR')}원
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              {totalMonthlyFixed > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      월 고정 지출 합계
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="error.main">
                      -{totalMonthlyFixed.toLocaleString('ko-KR')}원
                    </Typography>
                  </Stack>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 모바일 FAB — 설정으로 이동 */}
      {isMobile && (
        <Tooltip title="자산/구독 관리">
          <Fab
            color="primary"
            onClick={() => router.push('/settings')}
            sx={{ position: 'fixed', bottom: 80, right: 20, zIndex: 10 }}
          >
            <Gear weight="bold" size={24} />
          </Fab>
        </Tooltip>
      )}
    </Box>
  )
}
