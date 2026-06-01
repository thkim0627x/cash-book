import apiClient from '@/lib/axios'
import type { ApiResponse } from '@/types/common'
import type { Budget, BudgetCreateRequest, BudgetUpdateRequest } from '@/types/budget'

export const budgetService = {
  getList: async (year: number, month: number): Promise<ApiResponse<Budget[]>> => {
    const res = await apiClient.get<ApiResponse<Budget[]>>('/api/budgets', {
      params: { year, month },
    })
    return res.data
  },

  create: async (data: BudgetCreateRequest): Promise<ApiResponse<Budget>> => {
    const res = await apiClient.post<ApiResponse<Budget>>('/api/budgets', data)
    return res.data
  },

  update: async (id: number, data: BudgetUpdateRequest): Promise<ApiResponse<Budget>> => {
    const res = await apiClient.put<ApiResponse<Budget>>(`/api/budgets/${id}`, data)
    return res.data
  },

  remove: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/api/budgets/${id}`)
    return res.data
  },
}
