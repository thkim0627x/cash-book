'use client'
import {
  Card, CardContent, Typography, Stack, Box, Button,
  Divider, Avatar, IconButton, Tooltip, Skeleton,
} from '@mui/material'
import { Plus, Trash, ArrowRight } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import type { Transaction } from '@/types/transaction'

interface Props {
  transactions: Transaction[]
  loading: boolean
  onAdd: () => void
  onDelete: (id: number) => void
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function RecentTransactions({ transactions, loading, onAdd, onDelete }: Props) {
  const router = useRouter()

  return (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>최근 거래</Typography>
          <Button
            variant="text" size="small"
            endIcon={<ArrowRight size={14} />}
            onClick={() => router.push('/transactions')}
            sx={{ minWidth: 0, color: 'text.secondary', fontSize: '0.75rem' }}
          >
            전체 보기
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Stack spacing={1.5}>
            {[1,2,3,4].map(i => (
              <Stack key={i} direction="row" alignItems="center" spacing={1.5}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton width={70} height={16} />
              </Stack>
            ))}
          </Stack>
        ) : transactions.length === 0 ? (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              이번 달 거래내역이 없어요
            </Typography>
            <Button
              variant="contained" size="small"
              startIcon={<Plus size={14} />}
              onClick={onAdd}
            >
              첫 거래 추가
            </Button>
          </Stack>
        ) : (
          <Stack spacing={0}>
            {transactions.map((txn, idx) => (
              <Box key={txn.id}>
                {idx > 0 && <Divider sx={{ my: 0.5 }} />}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
                  <Avatar
                    sx={{
                      width: 36, height: 36,
                      bgcolor: txn.categoryColor ?? (txn.type === 'INCOME' ? '#e1f5fe' : '#ffebee'),
                      fontSize: '0.75rem',
                      color: txn.type === 'INCOME' ? '#0277bd' : '#c62828',
                      flexShrink: 0,
                    }}
                  >
                    {txn.categoryName?.slice(0, 1)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {txn.memo || txn.categoryName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {txn.categoryName} · {fmtDate(txn.txnDate)}
                    </Typography>
                  </Box>

                  <Stack alignItems="flex-end" spacing={0} sx={{ flexShrink: 0 }}>
                    <Typography
                      variant="body2" fontWeight={700}
                      color={txn.type === 'INCOME' ? 'info.main' : 'error.main'}
                    >
                      {txn.amount.toLocaleString('ko-KR')}원
                    </Typography>
                  </Stack>

                  <Tooltip title="삭제">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(txn.id)}
                      sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' }, flexShrink: 0 }}
                    >
                      <Trash size={14} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
