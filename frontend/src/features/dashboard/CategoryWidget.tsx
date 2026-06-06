'use client'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Divider,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '@/services/statistics.service'
import {
  CategoryDonutChart,
  type CategorySlice,
} from '@/features/statistics/CategoryDonutChart'

interface CategoryWidgetProps {
  year: number
  month: number
}

export function CategoryWidget({ year, month }: CategoryWidgetProps) {
  const router = useRouter()

  const { data: catRes, isLoading } = useQuery({
    queryKey: ['statistics', 'category', year, month],
    queryFn: () => statisticsService.getCategory(year, month),
  })

  const items = catRes?.data?.items ?? []

  const slices: CategorySlice[] = items.map((c) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    categoryColor: c.categoryColor,
    amount: c.amount,
    percentage: c.percentage,
  }))

  const totalExpense = catRes?.data?.totalExpense ?? 0

  return (
    <Card sx={{ height: '100%', borderRadius: 1 }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">카테고리별 지출</Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => router.push('/statistics')}
            sx={{ minWidth: 0 }}
          >
            분석 →
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <CategoryDonutChart
          data={slices}
          totalExpense={totalExpense}
          loading={isLoading}
        />
      </CardContent>
    </Card>
  )
}
