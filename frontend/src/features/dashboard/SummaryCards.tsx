'use client'
import { Grid, Card, CardContent, Box, Typography, useTheme } from '@mui/material'
import { TrendUp, TrendDown, Wallet } from '@phosphor-icons/react'
import type { TransactionSummary } from '@/types/transaction'

interface SummaryCardsProps {
  summary: TransactionSummary
}

type Tone = 'success' | 'error' | 'primary'

const cards: {
  key: 'income' | 'expense' | 'balance'
  label: string
  Icon: typeof TrendUp
  tone: Tone
  prefix: string
  getValue: (s: TransactionSummary) => number
}[] = [
  {
    key: 'income',
    label: '이번달 수입',
    Icon: TrendUp,
    tone: 'success',
    prefix: '+',
    getValue: (s) => s.totalIncome,
  },
  {
    key: 'expense',
    label: '이번달 지출',
    Icon: TrendDown,
    tone: 'error',
    prefix: '-',
    getValue: (s) => s.totalExpense,
  },
  {
    key: 'balance',
    label: '잔액',
    Icon: Wallet,
    tone: 'primary',
    prefix: '',
    getValue: (s) => s.balance,
  },
]

export function SummaryCards({ summary }: SummaryCardsProps) {
  const theme = useTheme()

  return (
    <Grid container spacing={2}>
      {cards.map(({ key, label, Icon, tone, prefix, getValue }) => (
        <Grid key={key} size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: `${tone}.light`, boxShadow: 'none', border: 'none' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Icon size={28} color={theme.palette[tone].main} />
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: `${tone}.main`, fontWeight: 700 }}>
                {prefix}
                {getValue(summary).toLocaleString('ko-KR')} 원
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
