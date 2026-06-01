'use client'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Stack,
  Chip,
} from '@mui/material'
import { X } from '@phosphor-icons/react'
import type { Transaction } from '@/types/transaction'
import { AmountText } from '@/components/common/AmountText'
import { EmptyState } from '@/components/common/EmptyState'

interface DayDetailDrawerProps {
  open: boolean
  onClose: () => void
  dateKey: string | null  // 'YYYY-MM-DD'
  transactions: Transaction[]
}

function formatDisplayDate(dateKey: string) {
  const d = new Date(dateKey)
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}

export function DayDetailDrawer({
  open,
  onClose,
  dateKey,
  transactions,
}: DayDetailDrawerProps) {
  const dayTransactions = dateKey
    ? transactions.filter((t) => t.txnDate === dateKey)
    : []

  const income = dayTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)
  const expense = dayTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 380 }, p: 0 },
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Box>
          <Typography variant="h6">
            {dateKey ? formatDisplayDate(dateKey) : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dayTransactions.length}건의 거래
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      {/* 당일 요약 */}
      {dayTransactions.length > 0 && (
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                수입
              </Typography>
              <Typography variant="subtitle1" color="success.main" fontWeight={700}>
                +{income.toLocaleString('ko-KR')}원
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                지출
              </Typography>
              <Typography variant="subtitle1" color="error.main" fontWeight={700}>
                -{expense.toLocaleString('ko-KR')}원
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                합계
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color={income - expense >= 0 ? 'success.main' : 'error.main'}
              >
                {(income - expense).toLocaleString('ko-KR')}원
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {/* 거래 목록 */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {dayTransactions.length === 0 ? (
          <EmptyState message="이 날의 거래내역이 없습니다." />
        ) : (
          <List disablePadding>
            {dayTransactions.map((txn, idx) => (
              <Box key={txn.id}>
                {idx > 0 && <Divider component="li" />}
                <ListItem sx={{ px: 3, py: 1.5 }}>
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor:
                          txn.categoryColor ??
                          (txn.type === 'INCOME' ? '#E8F5E9' : '#FFEBEE'),
                        fontSize: '0.8rem',
                      }}
                    >
                      {txn.categoryName?.slice(0, 1)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          label={txn.type === 'INCOME' ? '수입' : '지출'}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '10px',
                            fontWeight: 600,
                            bgcolor:
                              txn.type === 'INCOME' ? 'success.light' : 'error.light',
                            color:
                              txn.type === 'INCOME' ? 'success.dark' : 'error.dark',
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {txn.categoryName}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      txn.memo ? (
                        <Typography variant="caption" color="text.secondary">
                          {txn.memo}
                        </Typography>
                      ) : null
                    }
                  />
                  <AmountText
                    amount={txn.amount}
                    type={txn.type === 'INCOME' ? 'income' : 'expense'}
                    variant="body2"
                    sx={{ ml: 1, whiteSpace: 'nowrap' }}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  )
}
