'use client'
import { Stack, IconButton, Typography } from '@mui/material'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

interface MonthPickerProps {
  year: number
  month: number // 1-12
  onChange: (year: number, month: number) => void
}

export function MonthPicker({ year, month, onChange }: MonthPickerProps) {
  const prev = () =>
    month === 1 ? onChange(year - 1, 12) : onChange(year, month - 1)
  const next = () =>
    month === 12 ? onChange(year + 1, 1) : onChange(year, month + 1)

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <IconButton size="small" onClick={prev}>
        <CaretLeft />
      </IconButton>
      <Typography variant="h6" sx={{ minWidth: 120, textAlign: 'center' }}>
        {year}년 {month}월
      </Typography>
      <IconButton size="small" onClick={next}>
        <CaretRight />
      </IconButton>
    </Stack>
  )
}
