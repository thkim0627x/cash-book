'use client'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Button,
  Divider,
  Skeleton,
  Chip,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { assetService } from '@/services/asset.service'
import type { Asset, AssetType } from '@/types/asset'
import { EmptyState } from '@/components/common/EmptyState'

type AssetClass = 'ASSET' | 'LIABILITY'

function getClass(type: AssetType): AssetClass {
  return type === 'CREDIT_CARD' ? 'LIABILITY' : 'ASSET'
}

const TYPE_LABEL: Record<AssetType, string> = {
  SAVINGS: '예금/적금',
  CREDIT_CARD: '신용카드',
  CASH: '현금',
  ETC: '기타',
}

function AssetRow({ asset }: { asset: Asset }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.75 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
        <Chip
          label={TYPE_LABEL[asset.assetType]}
          size="small"
          sx={{ fontSize: '0.65rem', height: 20, borderRadius: '4px', flexShrink: 0 }}
        />
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {asset.name}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        fontWeight={700}
        color="info.main"
        sx={{ whiteSpace: 'nowrap', ml: 1 }}
      >
        {asset.initialAmount.toLocaleString('ko-KR')}원
      </Typography>
    </Stack>
  )
}

export function AssetSummaryWidget() {
  const router = useRouter()

  const { data: res, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetService.getAll(),
  })

  const assets: Asset[] = res?.data ?? []
  const assetItems = assets.filter((a) => getClass(a.assetType) === 'ASSET')
  const liabilityItems = assets.filter((a) => getClass(a.assetType) === 'LIABILITY')

  const totalAsset = assetItems.reduce((s, a) => s + a.initialAmount, 0)
  const totalLiability = liabilityItems.reduce((s, a) => s + a.initialAmount, 0)
  const netWorth = totalAsset - totalLiability

  const previewAssets = assets.slice(0, 3)

  return (
    <Card sx={{ height: '100%', borderRadius: 1 }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">자산 현황</Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => router.push('/assets')}
            sx={{ minWidth: 0 }}
          >
            자세히 →
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        {isLoading ? (
          <Stack spacing={1}>
            <Skeleton height={24} />
            <Skeleton height={24} />
            <Skeleton height={24} />
          </Stack>
        ) : assets.length === 0 ? (
          <EmptyState
            message="등록된 자산이 없습니다."
            actionLabel="자산 등록하기"
            onAction={() => router.push('/assets')}
          />
        ) : (
          <>
            {/* 순자산 요약 */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                mb: 2,
              }}
            >
              {[
                { label: '자산', value: totalAsset, color: 'info.main' },
                { label: '부채', value: totalLiability, color: 'error.main' },
                { label: '순자산', value: netWorth, color: netWorth >= 0 ? 'success.main' : 'error.main' },
              ].map(({ label, value, color }) => (
                <Box
                  key={label}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontSize: '0.65rem' }}>
                    {label}
                  </Typography>
                  <Typography fontWeight={700} color={color} sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                    {value < 0 ? '-' : ''}{Math.abs(value).toLocaleString('ko-KR')}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.25, fontSize: '0.6rem' }}>원</Typography>
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* 자산 목록 미리보기 */}
            <Stack divider={<Divider />}>
              {previewAssets.map((asset) => (
                <AssetRow key={asset.id} asset={asset} />
              ))}
            </Stack>

            {assets.length > 3 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
              >
                외 {assets.length - 3}개 더 보기
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
