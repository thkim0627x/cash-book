import { Typography, type TypographyProps } from '@mui/material'

interface AmountTextProps extends TypographyProps {
  amount: number
  type: 'income' | 'expense' | 'balance'
  showSign?: boolean
}

export function AmountText({ amount, type, showSign = true, ...props }: AmountTextProps) {
  let color: string
  let prefix: string

  if (type === 'income') {
    color = 'info.main'
    prefix = showSign ? '+' : ''
  } else if (type === 'expense') {
    color = 'error.main'
    prefix = ''  // 지출은 마이너스 표시 없음
  } else {
    // balance
    color = amount >= 0 ? 'success.main' : 'error.main'
    prefix = showSign && amount >= 0 ? '+' : ''
  }

  return (
    <Typography sx={{ color, fontWeight: 600 }} {...props}>
      {prefix}{Math.abs(amount).toLocaleString('ko-KR')}원
    </Typography>
  )
}
