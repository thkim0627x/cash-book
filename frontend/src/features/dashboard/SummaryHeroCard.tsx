'use client'
import { Box, Card, CardContent, Typography, Stack, Divider, Skeleton, useTheme } from '@mui/material'
import { TrendUp, TrendDown } from '@phosphor-icons/react'
import type { TransactionSummary } from '@/types/transaction'

interface Props {
  summary: TransactionSummary
  loading: boolean
  month: number
}

export function SummaryHeroCard({ summary, loading, month }: Props) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Skeleton width={120} height={20} sx={{ mb: 1 }} />
          <Skeleton width={200} height={48} sx={{ mb: 2 }} />
          <Skeleton height={1} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={2}>
            <Skeleton width="50%" height={40} />
            <Skeleton width="50%" height={40} />
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        boxShadow: `0 8px 24px ${theme.palette.primary.main}44`,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>

        {/* 라벨 */}
        <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
          {month}월 잔액
        </Typography>

        {/* 잔액 */}
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{ mt: 0.5, mb: 2.5, letterSpacing: -1, lineHeight: 1.1, fontSize: { xs: '2rem', sm: '2.5rem' } }}
        >
          {summary.balance < 0 ? '-' : ''}
          {Math.abs(summary.balance).toLocaleString('ko-KR')}
          <Typography component="span" variant="h5" sx={{ ml: 0.5, opacity: 0.85 }}>원</Typography>
        </Typography>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />

        {/* 수입 / 지출 */}
        <Stack direction="row" spacing={0} divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
              <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.15)' }}>
                <TrendUp size={14} />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>수입</Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {summary.totalIncome.toLocaleString('ko-KR')}
              <Typography component="span" variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>원</Typography>
            </Typography>
          </Box>

          <Box sx={{ flex: 1, pl: 2 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
              <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.15)' }}>
                <TrendDown size={14} />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>지출</Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {summary.totalExpense.toLocaleString('ko-KR')}
              <Typography component="span" variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>원</Typography>
            </Typography>
          </Box>
        </Stack>

      </CardContent>
    </Card>
  )
}
