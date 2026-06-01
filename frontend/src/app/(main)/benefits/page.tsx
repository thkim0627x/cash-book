'use client'
import { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Alert,
  Button,
  Stack,
  Chip,
  Pagination,
  Divider,
  Card,
  CardContent,
} from '@mui/material'
import { SlidersHorizontal, ArrowSquareOut } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { benefitService } from '@/services/benefit.service'
import { BenefitCard } from '@/features/benefits/BenefitCard'
import { BenefitCardSkeleton } from '@/features/benefits/BenefitCardSkeleton'
import type { BenefitCategory } from '@/types/benefit'
import { INCOME_LABELS, EMPLOYMENT_LABELS } from '@/types/benefit'

type TabValue = 'ALL' | BenefitCategory

const TABS: { value: TabValue; label: string; color?: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: '주거', label: '🏠 주거' },
  { value: '취업', label: '💼 취업' },
  { value: '복지', label: '🤝 복지' },
  { value: '금융', label: '💰 금융' },
]

const PAGE_SIZE = 12

export default function BenefitsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabValue>('ALL')
  const [page, setPage] = useState(1)

  // 혜택 목록
  const { data: benefitRes, isLoading, isError } = useQuery({
    queryKey: ['benefits', activeTab, page],
    queryFn: () =>
      benefitService.getList({
        category: activeTab === 'ALL' ? undefined : activeTab,
        page: page - 1,
        size: PAGE_SIZE,
      }),
  })

  // 내 조건
  const { data: condRes } = useQuery({
    queryKey: ['benefitConditions'],
    queryFn: benefitService.getConditions,
  })
  const myConditions = condRes?.data

  const benefits = benefitRes?.data?.content ?? []
  const totalPages = benefitRes?.data?.totalPages ?? 1
  const totalElements = benefitRes?.data?.totalElements ?? 0

  const handleTabChange = (_: React.SyntheticEvent, val: TabValue) => {
    setActiveTab(val)
    setPage(1)
  }

  return (
    <Box>
      {/* 페이지 헤더 */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'flex-start' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            청년 혜택
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            나에게 맞는 주거·취업·복지·금융 지원 혜택을 찾아보세요.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<SlidersHorizontal size={16} />}
          onClick={() => router.push('/benefits/conditions')}
          size="small"
          sx={{ flexShrink: 0 }}
        >
          내 조건 설정
        </Button>
      </Stack>

      {/* 내 조건 요약 배너 */}
      {myConditions && (
        <Card sx={{ mb: 3, bgcolor: 'primary.light', border: 'none', boxShadow: 'none' }}>
          <CardContent sx={{ py: 1.5, px: 2.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Typography variant="caption" fontWeight={700} color="primary.dark">
                내 조건
              </Typography>
              <Chip
                label={INCOME_LABELS[myConditions.incomeLevel]}
                size="small"
                sx={{ bgcolor: 'white', fontSize: '11px', height: 20 }}
              />
              <Chip
                label={EMPLOYMENT_LABELS[myConditions.employmentStatus]}
                size="small"
                sx={{ bgcolor: 'white', fontSize: '11px', height: 20 }}
              />
              <Chip
                label={myConditions.region}
                size="small"
                sx={{ bgcolor: 'white', fontSize: '11px', height: 20 }}
              />
              <Button
                size="small"
                onClick={() => router.push('/benefits/conditions')}
                endIcon={<ArrowSquareOut size={12} />}
                sx={{ ml: 'auto', color: 'primary.dark', fontSize: '12px', p: 0, minWidth: 0 }}
              >
                수정
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* 조건 미설정 안내 */}
      {!myConditions && !isLoading && (
        <Alert
          severity="info"
          action={
            <Button
              size="small"
              color="info"
              onClick={() => router.push('/benefits/conditions')}
            >
              조건 설정하기
            </Button>
          }
          sx={{ mb: 3 }}
        >
          내 조건을 설정하면 맞춤 혜택을 추천받을 수 있어요.
        </Alert>
      )}

      {/* 카테고리 탭 */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          borderBottom: '2px solid',
          borderColor: 'grey.200',
          '& .MuiTab-root': { minHeight: 44, fontWeight: 600, fontSize: '0.875rem' },
        }}
      >
        {TABS.map(({ value, label }) => (
          <Tab key={value} value={value} label={label} />
        ))}
      </Tabs>

      {/* 결과 수 */}
      {!isLoading && (
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            총{' '}
            <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
              {totalElements}
            </Typography>
            개의 혜택
          </Typography>
        </Stack>
      )}

      {/* 에러 */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          혜택 정보를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* 혜택 카드 그리드 */}
      <Grid container spacing={2.5}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <BenefitCardSkeleton />
              </Grid>
            ))
          : benefits.length === 0
          ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography fontSize={40} sx={{ mb: 1 }}>🔍</Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  해당 카테고리에 혜택이 없습니다.
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => { setActiveTab('ALL'); setPage(1) }}
                >
                  전체 혜택 보기
                </Button>
              </Box>
            </Grid>
          )
          : benefits.map((benefit) => (
              <Grid key={benefit.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BenefitCard benefit={benefit} />
              </Grid>
            ))
        }
      </Grid>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <>
          <Divider sx={{ mt: 4, mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => {
                setPage(p)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              color="primary"
              shape="rounded"
            />
          </Box>
        </>
      )}
    </Box>
  )
}
