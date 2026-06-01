import {
  Box,
  Typography,
  Stack,
  Avatar,
  LinearProgress,
} from '@mui/material'
import type { CategorySlice } from './CategoryDonutChart'

interface TopCategoryListProps {
  data: CategorySlice[]   // 이미 내림차순 정렬 가정
  topN?: number
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'] // 금/은/동

export function TopCategoryList({ data, topN = 5 }: TopCategoryListProps) {
  const top = data.slice(0, topN)
  const maxAmount = top[0]?.amount ?? 1

  if (top.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          지출 데이터가 없습니다.
        </Typography>
      </Box>
    )
  }

  return (
    <Stack spacing={2}>
      {top.map((item, idx) => {
        const barPct = (item.amount / maxAmount) * 100
        const rankColor = RANK_COLORS[idx] ?? '#BDBDBD'

        return (
          <Box key={item.categoryId}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
              {/* 순위 뱃지 */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: rankColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: idx < 3 ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ fontSize: '10px', color: idx < 3 ? '#fff' : '#757575' }}
                >
                  {idx + 1}
                </Typography>
              </Box>

              {/* 카테고리 아이콘 */}
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: item.categoryColor ?? '#e0e0e0',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                }}
              >
                {item.categoryName.slice(0, 1)}
              </Avatar>

              {/* 카테고리명 */}
              <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }} noWrap>
                {item.categoryName}
              </Typography>

              {/* 퍼센트 */}
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {item.percentage.toFixed(1)}%
              </Typography>

              {/* 금액 */}
              <Typography
                variant="body2"
                fontWeight={700}
                color="error.main"
                sx={{ minWidth: 90, textAlign: 'right', flexShrink: 0 }}
              >
                {item.amount.toLocaleString('ko-KR')}원
              </Typography>
            </Stack>

            {/* 진행 바 */}
            <Box sx={{ pl: 4.5 }}>
              <LinearProgress
                variant="determinate"
                value={barPct}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: item.categoryColor ?? '#C62828',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Box>
        )
      })}
    </Stack>
  )
}
