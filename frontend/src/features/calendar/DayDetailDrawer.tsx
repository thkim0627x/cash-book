'use client'
import {
  Drawer, Box, Typography, IconButton, Divider,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, Stack, Chip,
} from '@mui/material'
import { X } from '@phosphor-icons/react'
import type { Transaction } from '@/types/transaction'
import { AmountText } from '@/components/common/AmountText'
import { EmptyState } from '@/components/common/EmptyState'

interface DayDetailDrawerProps {
  open: boolean
  onClose: () => void
  dateKey: string | null
  transactions: Transaction[]
}

function formatDisplayDate(dateKey: string) {
  const d = new Date(dateKey)
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}

export function DayDetailDrawer({ open, onClose, dateKey, transactions }: DayDetailDrawerProps) {
  const dayTransactions = dateKey ? transactions.filter((t) => t.txnDate === dateKey) : []
  const income = dayTransactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = dayTransactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px 16px 0 0',
          maxHeight: '80dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pb: 'env(safe-area-inset-bottom)',
        }
      }}
    >
      {/* 드래그 핸들 */}
      <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2, mx: 'auto', mt: 1.5, mb: 0, flexShrink: 0 }} />

      {/* 헤더 + 닫기 버튼 */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5,
        borderBottom: '1px solid', borderColor: 'divider',
        flexShrink: 0,
      }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {dateKey ? formatDisplayDate(dateKey) : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">{dayTransactions.length}건의 거래</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </Box>

      {/* 당일 요약 */}
      {dayTransactions.length > 0 && (
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">수입</Typography>
              <Typography variant="subtitle2" color="info.main" fontWeight={700}>
                {income.toLocaleString('ko-KR')}원
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">지출</Typography>
              <Typography variant="subtitle2" color="error.main" fontWeight={700}>
                {expense.toLocaleString('ko-KR')}원
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">잔액</Typography>
              <Typography variant="subtitle2" fontWeight={700} color={balance >= 0 ? 'success.main' : 'error.main'}>
                {balance >= 0 ? '+' : '-'}{Math.abs(balance).toLocaleString('ko-KR')}원
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
                <ListItem sx={{ px: 2.5, py: 1.5 }}>
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar
                      sx={{
                        width: 36, height: 36, fontSize: '0.8rem',
                        ...(txn.categoryColor
                          ? { bgcolor: txn.categoryColor, color: '#fff' }
                          : txn.type === 'INCOME'
                            ? { bgcolor: '#e1f5fe', color: '#0277bd' }
                            : { bgcolor: '#ffebee', color: '#c62828' }
                        ),
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
                            height: 18, fontSize: '10px', fontWeight: 600,
                            bgcolor: txn.type === 'INCOME' ? '#e1f5fe' : '#ffebee',
                            color: txn.type === 'INCOME' ? '#0277bd' : '#c62828',
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>{txn.categoryName}</Typography>
                      </Stack>
                    }
                    secondary={txn.memo ? <Typography variant="caption" color="text.secondary">{txn.memo}</Typography> : null}
                  />
                  <AmountText amount={txn.amount} type={txn.type === 'INCOME' ? 'income' : 'expense'} variant="body2" sx={{ ml: 1, whiteSpace: 'nowrap' }} />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  )
}
