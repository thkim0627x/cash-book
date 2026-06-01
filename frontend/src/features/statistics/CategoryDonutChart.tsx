'use client'
import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Box, Typography, Stack, useMediaQuery, useTheme } from '@mui/material'

export interface CategorySlice {
  categoryId: number
  categoryName: string
  categoryColor: string | null
  amount: number
  percentage: number
}

interface CategoryDonutChartProps {
  data: CategorySlice[]
  totalExpense: number
  loading?: boolean
}

// 기본 팔레트 (categoryColor가 null일 때 순환 사용)
const DEFAULT_COLORS = [
  '#3F51B5', '#C62828', '#2E7D32', '#E65100', '#6A1B9A',
  '#00838F', '#AD1457', '#558B2F', '#4527A0', '#F57F17',
]

function getColor(slice: CategorySlice, idx: number) {
  return slice.categoryColor ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: CategorySlice }[]
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 2,
        p: 1.5,
        boxShadow: 2,
      }}
    >
      <Typography variant="caption" fontWeight={700} display="block">
        {d.categoryName}
      </Typography>
      <Typography variant="caption" color="error.main" fontWeight={700}>
        {d.amount.toLocaleString('ko-KR')}원
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {' '}({d.percentage.toFixed(1)}%)
      </Typography>
    </Box>
  )
}

export function CategoryDonutChart({
  data,
  totalExpense,
  loading,
}: CategoryDonutChartProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  if (loading) {
    return (
      <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          데이터 불러오는 중…
        </Typography>
      </Box>
    )
  }

  if (data.length === 0) {
    return (
      <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          지출 데이터가 없습니다.
        </Typography>
      </Box>
    )
  }

  const chartSize = isMobile ? 180 : 220
  const outerR = isMobile ? 72 : 90
  const innerR = isMobile ? 44 : 56

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
      {/* 도넛 차트 */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <ResponsiveContainer width={chartSize} height={chartSize}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerR}
              outerRadius={outerR}
              dataKey="amount"
              paddingAngle={2}
              onMouseEnter={(_: unknown, idx: number) => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              {data.map((slice, idx) => (
                <Cell
                  key={slice.categoryId}
                  fill={getColor(slice, idx)}
                  opacity={activeIdx === null || activeIdx === idx ? 1 : 0.5}
                  stroke={activeIdx === idx ? '#333' : 'none'}
                  strokeWidth={activeIdx === idx ? 1.5 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* 중앙 총 지출 텍스트 */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            lineHeight={1.2}
          >
            총 지출
          </Typography>
          <Typography
            variant="body2"
            fontWeight={700}
            color="error.main"
            lineHeight={1.4}
          >
            {(totalExpense / 10000).toFixed(0)}만원
          </Typography>
        </Box>
      </Box>

      {/* 범례 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack spacing={0.75}>
          {data.slice(0, 8).map((slice, idx) => (
            <Stack
              key={slice.categoryId}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 0.75,
                borderRadius: 1,
                bgcolor: activeIdx === idx ? 'action.hover' : 'transparent',
                cursor: 'default',
                opacity: activeIdx === null || activeIdx === idx ? 1 : 0.5,
                transition: 'opacity 0.15s, background-color 0.15s',
              }}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: getColor(slice, idx),
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="caption"
                noWrap
                sx={{ flex: 1, fontWeight: activeIdx === idx ? 700 : 500 }}
              >
                {slice.categoryName}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                color="error.main"
                sx={{ flexShrink: 0 }}
              >
                {slice.percentage.toFixed(1)}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Stack>
  )
}
