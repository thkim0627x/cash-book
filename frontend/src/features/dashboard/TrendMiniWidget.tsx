'use client'
import { Card, CardContent, Typography, Stack, Button, Divider } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '@/services/statistics.service'
import { MonthlyBarChart, type MonthlyData } from '@/features/statistics/MonthlyBarChart'

export function TrendMiniWidget() {
  const router = useRouter()

  const { data: trendRes, isLoading } = useQuery({
    queryKey: ['statistics', 'trend', 6],
    queryFn: () => statisticsService.getTrend(6),
  })

  // TrendPoint[] → MonthlyData[] (오래된→최신 가정, 서버 정렬 그대로 사용)
  const data: MonthlyData[] = (trendRes?.data ?? []).map((p) => ({
    label: `${String(p.year).slice(2)}.${String(p.month).padStart(2, '0')}`,
    income: p.income,
    expense: p.expense,
  }))

  return (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">월별 추이</Typography>
          <Button variant="text" size="small" onClick={() => router.push('/statistics')} sx={{ minWidth: 0 }}>
            통계 →
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <MonthlyBarChart data={data} loading={isLoading} />
      </CardContent>
    </Card>
  )
}
