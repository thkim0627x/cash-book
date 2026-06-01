'use client'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'

export interface MonthlyData {
  label: string   // 'YYYY.MM'
  income: number
  expense: number
}

interface MonthlyBarChartProps {
  data: MonthlyData[]
  loading?: boolean
}

function fmtAmount(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return String(val)
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 2,
        p: 1.5,
        boxShadow: 2,
        minWidth: 160,
      }}
    >
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Box key={entry.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="caption" sx={{ color: entry.color, fontWeight: 600 }}>
            {entry.name}
          </Typography>
          <Typography variant="caption" fontWeight={700}>
            {entry.value.toLocaleString('ko-KR')}원
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export function MonthlyBarChart({ data, loading }: MonthlyBarChartProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (loading) {
    return (
      <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">데이터 불러오는 중…</Typography>
      </Box>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#757575' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtAmount}
          tick={{ fontSize: 11, fill: '#757575' }}
          axisLine={false}
          tickLine={false}
          width={isMobile ? 36 : 52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => (value === 'income' ? '수입' : '지출')}
        />
        <Bar dataKey="income" name="income" fill="#2E7D32" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expense" name="expense" fill="#C62828" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
