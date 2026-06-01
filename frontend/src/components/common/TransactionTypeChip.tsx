import { Chip } from '@mui/material'
import type { TransactionType } from '@/types/category'

export function TransactionTypeChip({ type }: { type: TransactionType }) {
  return type === 'INCOME' ? (
    <Chip
      label="수입"
      size="small"
      sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }}
    />
  ) : (
    <Chip
      label="지출"
      size="small"
      sx={{ bgcolor: 'error.light', color: 'error.dark', fontWeight: 600 }}
    />
  )
}
