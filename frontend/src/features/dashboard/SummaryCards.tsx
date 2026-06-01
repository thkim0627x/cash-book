'use client'
import { Grid, Card, CardContent, Box, Typography } from '@mui/material'
import { TrendUp, TrendDown, Wallet } from '@phosphor-icons/react'
import type { TransactionSummary } from '@/types/transaction'

interface SummaryCardsProps {
  summary: TransactionSummary
}

const cards = [
  {
    key: 'income' as const,
    label: '이번달 수입',
    Icon: TrendUp,
    color: 'success.main',
    bg: '#E8F5E9',
    prefix: '+',
    getValue: (s: TransactionSummary) => s.totalIncome,
  },
  {
    key: 'expense' as const,
    label: '이번달 지출',
    Icon: TrendDown,
    color: 'error.main',
    bg: '#FFEBEE',
    prefix: '-',
    getValue: (s: TransactionSummary) => s.totalExpense,
  },
  {
    key: 'balance' as const,
    label: '잔액',
    Icon: Wallet,
    color: 'primary.main',
    bg: '#E8EAF6',
    prefix: '',
    getValue: (s: TransactionSummary) => s.balance,
  },
]

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <Grid container spacing={2}>
      {cards.map(({ key, label, Icon, color, bg, prefix, getValue }) => (
        <Grid key={key} size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: bg, boxShadow: 'none', border: 'none' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Icon size={28} color={color as string} />
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color, fontWeight: 700 }}>
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
