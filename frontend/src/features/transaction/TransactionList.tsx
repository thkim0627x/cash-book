'use client'
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box,
  Tooltip,
} from '@mui/material'
import { Trash } from '@phosphor-icons/react'
import type { Transaction } from '@/types/transaction'
import { AmountText } from '@/components/common/AmountText'
import { EmptyState } from '@/components/common/EmptyState'
import { TransactionTypeChip } from '@/components/common/TransactionTypeChip'

interface TransactionListProps {
  transactions: Transaction[]
  onDelete?: (id: number) => void
  compact?: boolean // 대시보드용 간략 모드
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
}

export function TransactionList({ transactions, onDelete, compact = false }: TransactionListProps) {
  if (transactions.length === 0) {
    return <EmptyState message="거래내역이 없습니다." />
  }

  return (
    <List disablePadding>
      {transactions.map((txn) => (
        <ListItem
          key={txn.id}
          disablePadding
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 2,
            '&:hover': { bgcolor: 'action.hover' },
            cursor: 'default',
          }}
          secondaryAction={
            !compact && onDelete ? (
              <Tooltip title="삭제">
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => onDelete(txn.id)}
                  sx={{ color: 'error.main' }}
                >
                  <Trash size={16} />
                </IconButton>
              </Tooltip>
            ) : null
          }
        >
          <ListItemAvatar sx={{ minWidth: 40 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor:
                  txn.categoryColor ?? (txn.type === 'INCOME' ? 'success.light' : 'error.light'),
                fontSize: '0.75rem',
              }}
            >
              {txn.categoryName?.slice(0, 1)}
            </Avatar>
          </ListItemAvatar>

          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {!compact && (
                  <TransactionTypeChip type={txn.type} />
                )}
                <Typography variant="body2" fontWeight={500}>
                  {txn.categoryName}
                </Typography>
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {formatDate(txn.txnDate)}
                {txn.memo ? ` · ${txn.memo}` : ''}
              </Typography>
            }
          />

          <AmountText
            amount={txn.amount}
            type={txn.type === 'INCOME' ? 'income' : 'expense'}
            variant="body2"
            sx={{ ml: 1, whiteSpace: 'nowrap' }}
          />
        </ListItem>
      ))}
    </List>
  )
}
