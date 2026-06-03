'use client'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  Chip,
  Skeleton,
} from '@mui/material'
import { Gift, ArrowSquareOut, SlidersHorizontal } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { benefitService } from '@/services/benefit.service'
import type { Benefit } from '@/types/benefit'

function ddayLabel(deadline: string | null): string {
  if (!deadline) return '상시'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(deadline)
  end.setHours(0, 0, 0, 0)
  const diff = Math.floor((end.getTime() - today.getTime()) / 86_400_000)
  if (diff < 0) return '마감'
  if (diff === 0) return 'D-Day'
  return `D-${diff}`
}

function RecommendRow({ benefit }: { benefit: Benefit }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
          <Chip label={benefit.category} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
          <Chip label={ddayLabel(benefit.deadline)} size="small" color="error" sx={{ height: 18, fontSize: 10 }} />
        </Stack>
        <Typography variant="body2" fontWeight={600} noWrap>
          {benefit.title}
        </Typography>
        <Typography variant="caption" color="primary.main" fontWeight={600} noWrap display="block">
          {benefit.benefit}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="contained"
        endIcon={<ArrowSquareOut size={14} />}
        href={benefit.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        component="a"
        sx={{ flexShrink: 0 }}
      >
        신청
      </Button>
    </Stack>
  )
}

export function BenefitRecommendBanner() {
  const router = useRouter()

  const { data: condRes } = useQuery({
    queryKey: ['benefitConditions'],
    queryFn: benefitService.getConditions,
  })
  const hasConditions = !!condRes?.data

  const { data: recRes, isLoading } = useQuery({
    queryKey: ['benefits', 'recommended'],
    queryFn: () => benefitService.getRecommended(2),
    enabled: hasConditions, // 조건 있을 때만 추천 패칭
  })
  const recommended = recRes?.data ?? []

  return (
    <Card
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 100%)`,
        border: '1px solid',
        borderColor: 'primary.light',
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Gift size={22} weight="fill" color="var(--mui-palette-primary-main)" />
          <Typography variant="h6">청년 혜택 추천</Typography>
        </Stack>

        {/* 조건 미설정 → CTA */}
        {!hasConditions ? (
          <Stack spacing={1.5} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              소득·취업·지역 조건을 설정하면 나에게 맞는 청년 혜택을 추천해 드려요.
            </Typography>
            <Button
              variant="contained"
              startIcon={<SlidersHorizontal size={16} />}
              onClick={() => router.push('/benefits/conditions')}
            >
              조건 설정하기
            </Button>
          </Stack>
        ) : isLoading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={64} />
          </Stack>
        ) : recommended.length === 0 ? (
          <Stack spacing={1.5} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              현재 조건에 맞는 추천 혜택이 없어요. 전체 혜택을 둘러보세요.
            </Typography>
            <Button variant="outlined" onClick={() => router.push('/benefits')}>
              전체 혜택 보기
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {recommended.map((b) => (
              <RecommendRow key={b.id} benefit={b} />
            ))}
            <Button
              variant="text"
              size="small"
              onClick={() => router.push('/benefits')}
              sx={{ alignSelf: 'flex-end' }}
            >
              더 많은 혜택 보기 →
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
