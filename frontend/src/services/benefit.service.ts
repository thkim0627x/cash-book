import apiClient from '@/lib/axios'
import type { ApiResponse, PageResponse } from '@/types/common'
import type { Benefit, BenefitCategory, BenefitConditions } from '@/types/benefit'

export interface BenefitListParams {
  category?: BenefitCategory
  page?: number
  size?: number
}

export const benefitService = {
  getList: async (params: BenefitListParams = {}): Promise<ApiResponse<PageResponse<Benefit>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Benefit>>>('/api/benefits', {
      params: {
        ...params,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return res.data
  },

  getConditions: async (): Promise<ApiResponse<BenefitConditions | null>> => {
    const res = await apiClient.get<ApiResponse<BenefitConditions | null>>(
      '/api/benefits/conditions'
    )
    return res.data
  },

  saveConditions: async (data: BenefitConditions): Promise<ApiResponse<BenefitConditions>> => {
    const res = await apiClient.put<ApiResponse<BenefitConditions>>(
      '/api/benefits/conditions',
      data
    )
    return res.data
  },
}
