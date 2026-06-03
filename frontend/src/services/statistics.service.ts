import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/common'
import type { CategoryStatisticsResponse, TrendPoint } from '@/types/statistics'

export const statisticsService = {
  // 최근 N개월 수입/지출 추이
  getTrend: async (months = 6): Promise<ApiResponse<TrendPoint[]>> => {
    const res = await apiClient.get<ApiResponse<TrendPoint[]>>(
      '/api/statistics/trend',
      {
        params: { months },
      }
    )
    return res.data
  },

  // 특정 월 카테고리별 지출 비중
  getCategory: async (
    year: number,
    month: number
  ): Promise<ApiResponse<CategoryStatisticsResponse>> => {
    const res = await apiClient.get<ApiResponse<CategoryStatisticsResponse>>(
      '/api/statistics/category',
      {
        params: { year, month },
      }
    )

    return res.data
  },
}
