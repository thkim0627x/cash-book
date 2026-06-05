import {
  Box,
  LinearProgress,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material'
import { PencilSimple, Trash } from '@phosphor-icons/react/dist/ssr'
import type { BudgetWithUsage } from '@/types/budget'

interface BudgetProgressBarProps {
  budget: BudgetWithUsage
  onEdit: (budget: BudgetWithUsage) => void
  onDelete: (id: number) => void
}

function getColor(pct: number): 'error' | 'warning' | 'primary' {
  if (pct >= 100) return 'error'
  if (pct >= 80) return 'warning'
  return 'primary'
}

export function BudgetProgressBar({ budget, onEdit, onDelete }: BudgetProgressBarProps) {
  const { categoryName, categoryColor, amount, usedAmount, percentage, isOver } = budget
  const color = getColor(percentage)
  const displayPct = Math.min(percentage, 100)
  const remaining = amount - usedAmount

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isOver ? 'error.light' : 'grey.200',
        bgcolor: isOver ? 'rgba(198,40,40,0.03)' : 'background.paper',
        transition: 'all 0.2s',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        {/* 카테고리 아이콘 */}
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: categoryColor ?? '#e0e0e0',
            fontSize: '0.8rem',
          }}
        >
          {categoryName?.slice(0, 1)}
        </Avatar>

        {/* 카테고리명 + 예산 초과 뱃지 */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              {categoryName}
            </Typography>
            {isOver && (
              <Typography
                variant="caption"
                sx={{
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  fontWeight: 700,
                  fontSize: '10px',
                }}
              >
                초과
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {usedAmount.toLocaleString('ko-KR')}원 /&nbsp;
            {amount.toLocaleString('ko-KR')}원
            &nbsp;
            <Typography
              component="span"
              variant="caption"
              color={remaining >= 0 ? 'text.secondary' : 'error.main'}
              fontWeight={600}
            >
              ({remaining >= 0 ? `잔여 ${remaining.toLocaleString('ko-KR')}원` : `${Math.abs(remaining).toLocaleString('ko-KR')}원 초과`})
            </Typography>
          </Typography>
        </Box>

        {/* 퍼센트 + 수정/삭제 */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography
            variant="caption"
            fontWeight={700}
            color={`${color}.main`}
            sx={{ minWidth: 36, textAlign: 'right' }}
          >
            {Math.round(percentage)}%
          </Typography>
          <Tooltip title="수정">
            <IconButton size="small" onClick={() => onEdit(budget)}>
              <PencilSimple size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => onDelete(budget.id)}>
              <Trash size={15} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* 프로그레스 바 */}
      <LinearProgress
        variant="determinate"
        value={displayPct}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  )
}
