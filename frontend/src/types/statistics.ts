// 월별 추이 1포인트 (GET /api/statistics/trend)
export interface TrendPoint {
  year: number
  month: number
  income: number
  expense: number
}

// 카테고리별 지출 통계 1건 (GET /api/statistics/category)
export interface CategoryStat {
  categoryId: number
  categoryName: string
  categoryColor: string | null
  amount: number
  percentage: number
}

export interface CategoryStatisticsResponse {
  year: number
  month: number
  totalExpense: number
  items: CategoryStat[]
}
