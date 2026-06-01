import { Typography, type TypographyProps } from '@mui/material'

interface AmountTextProps extends TypographyProps {
  amount: number
  type: 'income' | 'expense'
  showSign?: boolean
}

export function AmountText({ amount, type, showSign = true, ...props }: AmountTextProps) {
  const color = type === 'income' ? 'success.main' : 'error.main'
  const sign = type === 'income' ? '+' : '-'
  return (
    <Typography sx={{ color, fontWeight: 600 }} {...props}>
      {showSign ? sign : ''}
      {amount.toLocaleString('ko-KR')} 원
    </Typography>
  )
}
