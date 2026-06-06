'use client'
import { useMemo } from 'react'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import type { Transaction } from '@/types/transaction'

interface CalendarGridProps {
  year: number
  month: number
  transactions: Transaction[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function todayKey() {
  const d = new Date()
  return toKey(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function CalendarGrid({ year, month, transactions, selectedDate, onSelectDate }: CalendarGridProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const today = todayKey()

  const dailyMap = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {}
    for (const t of transactions) {
      if (!map[t.txnDate]) map[t.txnDate] = { income: 0, expense: 0 }
      if (t.type === 'INCOME') map[t.txnDate].income += t.amount
      else map[t.txnDate].expense += t.amount
    }
    return map
  }, [transactions])

  const cells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const lastDate = new Date(year, month, 0).getDate()
    const result: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= lastDate; d++) result.push(d)
    while (result.length < 42) result.push(null)
    return result
  }, [year, month])

  const cellMinH = isMobile ? 60 : 96

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid', borderColor: 'grey.200' }}>
        {DAY_LABELS.map((label, i) => (
          <Box key={label} sx={{ textAlign: 'center', py: 1, bgcolor: 'grey.50', borderRight: i < 6 ? '1px solid' : 'none', borderColor: 'grey.200' }}>
            <Typography
              variant="caption"
              fontWeight={600}
              color={i === 0 ? 'error.main' : i === 6 ? 'info.main' : 'text.secondary'}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid', borderColor: 'grey.200', borderTop: 'none' }}>
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <Box
                key={`empty-${idx}`}
                sx={{ minHeight: cellMinH, bgcolor: 'grey.50', borderRight: idx % 7 < 6 ? '1px solid' : 'none', borderBottom: '1px solid', borderColor: 'grey.200' }}
              />
            )
          }

          const dateKey = toKey(year, month, day)
          const data = dailyMap[dateKey]
          const isToday = dateKey === today
          const isSelected = dateKey === selectedDate
          const isSunday = idx % 7 === 0
          const isSaturday = idx % 7 === 6

          return (
            <Box
              key={dateKey}
              component="button"
              onClick={() => onSelectDate(dateKey)}
              sx={{
                minHeight: cellMinH,
                p: isMobile ? '4px 4px' : '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                cursor: 'pointer',
                border: 'none',
                borderRight: idx % 7 < 6 ? '1px solid' : 'none',
                borderBottom: '1px solid',
                borderColor: 'grey.200',
                bgcolor: isToday ? 'primary.light' : isSelected ? 'rgba(63,81,181,0.06)' : 'background.paper',
                outline: isSelected ? '2px solid' : 'none',
                outlineColor: 'primary.main',
                outlineOffset: '-2px',
                textAlign: 'left',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: isToday ? 'primary.light' : 'action.hover' },
              }}
            >
              <Typography
                variant="caption"
                fontWeight={isToday ? 700 : 500}
                color={isSunday ? 'error.main' : isSaturday ? 'info.main' : isToday ? 'primary.dark' : 'text.primary'}
                sx={{ lineHeight: 1.2 }}
              >
                {day}
              </Typography>

              {data?.income ? (
                <Typography variant="caption" color="info.main" fontWeight={600} sx={{ fontSize: isMobile ? '9px' : '11px', lineHeight: 1.2, display: 'block' }}>
                  +{data.income.toLocaleString('ko-KR')}
                </Typography>
              ) : null}

              {data?.expense ? (
                <Typography variant="caption" color="error.main" fontWeight={600} sx={{ fontSize: isMobile ? '9px' : '11px', lineHeight: 1.2, display: 'block' }}>
                  {data.expense.toLocaleString('ko-KR')}
                </Typography>
              ) : null}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
