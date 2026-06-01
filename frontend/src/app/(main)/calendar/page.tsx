'use client'
import { useState } from 'react'
import { Box, Card, CardContent, Stack, Typography, Alert, useMediaQuery, useTheme } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import { CalendarGrid } from '@/features/calendar/CalendarGrid'
import { DayDetailDrawer } from '@/features/calendar/DayDetailDrawer'
import { MonthPicker } from '@/components/common/MonthPicker'
import { ListSkeleton } from '@/components/common/ListSkeleton'

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { data: txnRes, isLoading, isError } = useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => transactionService.getList({ year, month, size: 500 }),
  })

  const transactions = txnRes?.data?.content ?? []
  const summary = transactionService.getSummary(transactions)

  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(dateKey)
    setDrawerOpen(true)
  }

  const handleMonthChange = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
    setSelectedDate(null)
    setDrawerOpen(false)
  }

  return (
    <Box>
      {/* 상단: 월 선택 + 월간 요약 */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '12px !important' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <MonthPicker year={year} month={month} onChange={handleMonthChange} />

            {!isLoading && (
              <Stack direction="row" spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    총 수입
                  </Typography>
                  <Typography variant="subtitle2" color="success.main" fontWeight={700}>
                    +{summary.totalIncome.toLocaleString('ko-KR')}원
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    총 지출
                  </Typography>
                  <Typography variant="subtitle2" color="error.main" fontWeight={700}>
                    -{summary.totalExpense.toLocaleString('ko-KR')}원
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    잔액
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color={summary.balance >= 0 ? 'primary.main' : 'error.main'}
                  >
                    {summary.balance.toLocaleString('ko-KR')}원
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      )}

      {/* 달력 */}
      <Card>
        <CardContent sx={{ p: isMobile ? 1 : 2, '&:last-child': { pb: isMobile ? 1 : 2 } }}>
          {isLoading ? (
            <ListSkeleton rows={6} />
          ) : (
            <CalendarGrid
              year={year}
              month={month}
              transactions={transactions}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          )}
        </CardContent>
      </Card>

      {/* 날짜 상세 드로어 */}
      <DayDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        dateKey={selectedDate}
        transactions={transactions}
      />
    </Box>
  )
}
